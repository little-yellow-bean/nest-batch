import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JobListener } from '../listener';
import { Step } from '../step';
import { JobRepository } from '../repository';
import { ExecutionStatus, JobExecution } from '../execution';
import { LIB_NAME } from '../constants';

export abstract class Job {
  protected name: string;
  protected steps: Step<any, any>[] = [];
  protected listeners: JobListener[] = [];
  protected jobRepository: JobRepository;
  protected readonly logger = new Logger(LIB_NAME);

  async execute(parameters: Record<string, any>): Promise<JobExecution> {
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
          .setLastUpdatedTime(new Date())
      );
      // TODO: Add pre-started works in the future
      jobExecution = await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.STARTED)
          .setLastUpdatedTime(new Date())
      );

      this.processSteps(jobExecution.getId())
        .then(async (status) => {
          jobExecution = await this.jobRepository.updateJobExecution(
            jobExecution
              .transitionStatus(status)
              .setEndTime(new Date())
              .setLastUpdatedTime(new Date())
          );
          if (status === ExecutionStatus.STOPPED) {
            this.logger.log(`Job ${this.name} is stopped`);
          }
          if (status === ExecutionStatus.COMPLETED) {
            await this.notifyListenersAfterJob(jobExecution);
            this.logger.log(`Job ${this.name} completed successfully`);
          }
        })
        .catch(async (error: Error) => {
          await this.jobRepository.updateJobExecution(
            jobExecution
              .transitionStatus(ExecutionStatus.FAILED)
              .setEndTime(new Date())
              .setLastUpdatedTime(new Date())
              .setFailureExceptions([error.message])
          );
          await this.notifyListenersOnError(jobExecution, error);
          this.logger.error(`Job ${this.name} failed: ${error}`);
        });
      return jobExecution;
    } catch (error: any) {
      await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .setFailureExceptions([error.message])
      );
      await this.notifyListenersOnError(jobExecution, error);
      this.logger.error(`Job ${this.name} failed: ${error}`);
      throw error;
    }
  }

  abstract processSteps(jobId: string): Promise<ExecutionStatus>;

  getSteps() {
    return this.steps;
  }

  addStep(step: Step<any, any>) {
    this.steps.push(step);
    return this;
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setJobRepository(jobRepository: JobRepository) {
    this.jobRepository = jobRepository;
    return this;
  }

  addListener(listener: JobListener) {
    this.listeners.push(listener);
    return this;
  }

  protected async notifyListenersBeforeJob(
    jobExecution: JobExecution
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.beforeJob?.(jobExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener before job: ${error}`
        );
      }
    }
  }

  protected async notifyListenersAfterJob(
    jobExecution: JobExecution
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.afterJob?.(jobExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener after job: ${error}`
        );
      }
    }
  }

  protected async notifyListenersOnError(
    jobExecution: JobExecution,
    error: Error
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.onJobError?.(jobExecution, error);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener on job error: ${error}`
        );
      }
    }
  }
}
