import { Logger } from '@nestjs/common';
import { JobListener } from '../listener';
import { Step } from '../step';
import { JobRepository } from '../repository';
import { JobExecution } from '../execution';
import { LIB_NAME } from '../constants';

export abstract class Job {
  protected name: string;
  protected parameters: Record<string, any>;
  protected steps: Step<any, any>[];
  protected listeners: JobListener[];
  protected jobRepository: JobRepository;
  protected readonly logger = new Logger(LIB_NAME);

  abstract execute(): Promise<JobExecution>;

  addStep(step: Step<any, any>) {
    this.steps.push(step);
    return this;
  }

  setParameters(parameters: Record<string, any>) {
    this.parameters = parameters;
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
    jobExecution: JobExecution,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.beforeJob?.(jobExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener before job: ${error}`,
        );
      }
    }
  }

  protected async notifyListenersAfterJob(
    jobExecution: JobExecution,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.afterJob?.(jobExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener after job: ${error}`,
        );
      }
    }
  }

  protected async notifyListenersOnError(
    jobExecution: JobExecution,
    error: Error,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.onJobError?.(jobExecution, error);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener on job error: ${error}`,
        );
      }
    }
  }
}
