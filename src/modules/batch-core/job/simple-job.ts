import { v4 as uuid } from 'uuid';
import { Job } from './job';
import { ExecutionStatus, JobExecution } from '../execution';

export class SimpleJob extends Job {
  override async execute(
    parameters: Record<string, any>,
  ): Promise<JobExecution> {
    if (!this.name?.trim().length) {
      throw new Error('Job name is required');
    }
    if (!this.jobRepository) {
      throw new Error('Job repository is required');
    }

    let jobExecution = new JobExecution()
      .setId(uuid())
      .setCreateTime(new Date())
      .setJobParameters(parameters)
      .setName(this.name)
      .transitionStatus(ExecutionStatus.CREATED)
      .setLastUpdatedTime(new Date());

    try {
      jobExecution = await this.jobRepository.saveJobExecution(jobExecution);
      await this.notifyListenersBeforeJob(jobExecution);
      jobExecution = await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.STARTING)
          .setStartTime(new Date())
          .setLastUpdatedTime(new Date()),
      );
      // TODO: Add pre-started works in the future
      jobExecution = await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.STARTED)
          .setLastUpdatedTime(new Date()),
      );

      this.processSteps(jobExecution.getId()).catch(async (error: Error) => {
        await this.jobRepository.updateJobExecution(
          jobExecution
            .transitionStatus(ExecutionStatus.FAILED)
            .setEndTime(new Date())
            .setLastUpdatedTime(new Date())
            .setFailureExceptions([error.message]),
        );
        await this.notifyListenersOnError(jobExecution, error);
        this.logger.error(`Job ${this.name} failed: ${error}`);
      });
      return jobExecution;
    } catch (error) {
      await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .setFailureExceptions([error.message]),
      );
      await this.notifyListenersOnError(jobExecution, error);
      this.logger.error(`Job ${this.name} failed: ${error}`);
      throw error;
    }
  }

  protected async processSteps(jobId: string) {
    let jobExecution: JobExecution;
    for (const step of this.steps) {
      jobExecution = await this.jobRepository.findJobExecutionById(jobId);
      if (jobExecution.isStopping()) {
        await this.jobRepository.updateJobExecution(
          jobExecution
            .transitionStatus(ExecutionStatus.STOPPED)
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
        .transitionStatus(ExecutionStatus.COMPLETED)
        .setEndTime(new Date())
        .setLastUpdatedTime(new Date()),
    );
    await this.notifyListenersAfterJob(jobExecution);
    this.logger.log(`Job ${this.name} completed successfully`);
  }
}
