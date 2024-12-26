import { v4 as uuid } from 'uuid';
import { Job } from './job';
import { ExecutionStatus, JobExecution } from '../execution';

export class SimpleJob extends Job {
  private id: string;

  override async execute(): Promise<JobExecution> {
    this.id = uuid();
    const jobExecution = new JobExecution()
      .setId(this.id)
      .setCreateTime(new Date())
      .setJobParameters(this.parameters)
      .setName(this.name)
      .setStatus(ExecutionStatus.CREATED)
      .setLastUpdatedTime(new Date());
    try {
      await this.jobRepository.saveJobExecution(jobExecution);
      await this.notifyListenersBeforeJob(jobExecution);
      await this.jobRepository.updateJobExecution(
        jobExecution
          .setStatus(ExecutionStatus.STARTING)
          .setLastUpdatedTime(new Date()),
      );
      // TODO: Add pre-started works in the future
      await this.jobRepository.updateJobExecution(
        jobExecution
          .setStatus(ExecutionStatus.STARTED)
          .setLastUpdatedTime(new Date()),
      );

      this.processSteps().catch(async (error) => {
        await this.jobRepository.updateJobExecution(
          jobExecution
            .setStatus(ExecutionStatus.FAILED)
            .setEndTime(new Date())
            .setLastUpdatedTime(new Date())
            .addFailureException(error),
        );
        await this.notifyListenersOnError(jobExecution, error);
        this.logger.error(`Job ${this.name} failed: ${error}`);
      });
      return jobExecution;
    } catch (error) {
      await this.jobRepository.updateJobExecution(
        jobExecution
          .setStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .addFailureException(error),
      );
      this.notifyListenersOnError(jobExecution, error);
      this.logger.error(`Job ${this.name} failed: ${error}`);
      throw error;
    }
  }

  protected async processSteps() {
    let jobExecution: JobExecution;
    for (const step of this.steps) {
      jobExecution = await this.jobRepository.findJobExecutionById(this.id);
      if (jobExecution.isStopping()) {
        await this.jobRepository.updateJobExecution(
          jobExecution
            .setStatus(ExecutionStatus.STOPPED)
            .setEndTime(new Date())
            .setLastUpdatedTime(new Date()),
        );
        this.logger.log(`Job ${this.name} is stopped`);
        return;
      }
      await step.execute(jobExecution);
    }
    await this.jobRepository.updateJobExecution(
      jobExecution
        .setStatus(ExecutionStatus.COMPLETED)
        .setEndTime(new Date())
        .setLastUpdatedTime(new Date()),
    );
    await this.notifyListenersAfterJob(jobExecution);
    this.logger.log(`Job ${this.name} completed successfully`);
  }
}
