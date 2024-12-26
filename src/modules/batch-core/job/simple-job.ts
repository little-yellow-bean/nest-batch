import { v4 as uuid } from 'uuid';
import { Job } from './job';
import { ExecutionStatus, JobExecution } from '../execution';

export class SimpleJob extends Job {
  override async execute(): Promise<JobExecution> {
    const jobExecution = new JobExecution()
      .setId(uuid())
      .setCreateTime(new Date())
      .setJobParameters(this.parameters)
      .setName(this.name)
      .setStatus(ExecutionStatus.CREATED)
      .setLastUpdatedTime(new Date());
    try {
      if (!this.name) {
        throw new Error('Job name is required');
      }
      if (!this.jobRepository) {
        throw new Error('Job repository is required');
      }
      await this.jobRepository.saveJobExecution(jobExecution);
      await this.notifyListenersBeforeJob(jobExecution);
      await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
        status: ExecutionStatus.STARTING,
        lastUpdatedTime: new Date(),
      });
      // TODO: Add pre-started works in the future
      await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
        status: ExecutionStatus.STARTED,
        lastUpdatedTime: new Date(),
      });

      this.processSteps(jobExecution.getId()).catch(async (error) => {
        await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
          status: ExecutionStatus.FAILED,
          endTime: new Date(),
          lastUpdatedTime: new Date(),
          failureExceptions: [error.message],
        });
        await this.notifyListenersOnError(jobExecution, error);
        this.logger.error(`Job ${this.name} failed: ${error}`);
      });
      return jobExecution;
    } catch (error) {
      await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
        status: ExecutionStatus.FAILED,
        endTime: new Date(),
        lastUpdatedTime: new Date(),
        failureExceptions: [error.message],
      });
      this.notifyListenersOnError(jobExecution, error);
      this.logger.error(`Job ${this.name} failed: ${error}`);
      throw error;
    }
  }

  protected async processSteps(jobId: string) {
    let jobExecution: JobExecution;
    for (const step of this.steps) {
      jobExecution = await this.jobRepository.findJobExecutionById(jobId);
      if (jobExecution.isStopping()) {
        await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
          status: ExecutionStatus.STOPPED,
          endTime: new Date(),
          lastUpdatedTime: new Date(),
        });
        this.logger.log(`Job ${this.name} is stopped`);
        return;
      }
      await step.execute(jobExecution);
    }
    await this.jobRepository.updateJobExecutionById(jobExecution.getId(), {
      status: ExecutionStatus.COMPLETED,
      endTime: new Date(),
      lastUpdatedTime: new Date(),
    });
    await this.notifyListenersAfterJob(jobExecution);
    this.logger.log(`Job ${this.name} completed successfully`);
  }
}
