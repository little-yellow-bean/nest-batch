import { Logger } from "@nestjs/common";

import { LIB_NAME } from "../constants";
import { ExecutionStatus, JobExecution } from "../execution";
import { JobListener } from "../listener";
import { JobRepository } from "../repository";
import { Step } from "../step";

export abstract class Job {
  protected name: string;
  protected steps: Step<unknown, unknown>[] = [];
  protected listeners: JobListener[] = [];
  protected jobRepository: JobRepository;
  protected readonly logger = new Logger(LIB_NAME);

  constructor(name: string) {
    if (!name.trim().length) {
      throw new Error("Job name is required and cannot be empty");
    }
    this.name = name;
  }

  async execute(parameters: Record<string, unknown>): Promise<JobExecution> {
    this.logger.log(`Starting job: ${this.name}, with parameters: ${JSON.stringify(parameters)}`);
    let jobExecution = new JobExecution({ jobParameters: parameters, name: this.name });

    try {
      jobExecution = await this.jobRepository.saveJobExecution(jobExecution);
      await this.notifyListenersBeforeJob(jobExecution);
      jobExecution = await this.jobRepository.updateJobExecution(
        jobExecution.transitionStatus(ExecutionStatus.STARTING).setStartTime(new Date()).setLastUpdatedTime(new Date()),
      );
      // TODO: Add pre-started works in the future
      jobExecution = await this.jobRepository.updateJobExecution(
        jobExecution.transitionStatus(ExecutionStatus.STARTED).setLastUpdatedTime(new Date()),
      );

      this.processSteps(jobExecution.getId())
        .then(async (status) => {
          jobExecution = await this.jobRepository.updateJobExecution(
            jobExecution.transitionStatus(status).setEndTime(new Date()).setLastUpdatedTime(new Date()),
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
              .setFailureExceptions([error.message]),
          );
          await this.notifyListenersOnError(jobExecution, error);
          this.logger.error(`Job ${this.name} failed: ${error}`, error.stack);
        });
      return jobExecution;
    } catch (error) {
      await this.jobRepository.updateJobExecution(
        jobExecution
          .transitionStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .setFailureExceptions([(error as Error).message]),
      );
      await this.notifyListenersOnError(jobExecution, error as Error);
      this.logger.error(`Job ${this.name} failed: ${error}`);
      throw error;
    }
  }

  abstract processSteps(jobId: string): Promise<ExecutionStatus>;

  getSteps() {
    return this.steps;
  }

  addStep(step: Step<unknown, unknown>) {
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

  protected async notifyListenersBeforeJob(jobExecution: JobExecution): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.beforeJob?.(jobExecution);
      } catch (error) {
        this.logger.error(`Error occurred while notifying listener before job: ${error}`);
        throw error;
      }
    }
  }

  protected async notifyListenersAfterJob(jobExecution: JobExecution): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.afterJob?.(jobExecution);
      } catch (error) {
        this.logger.error(`Error occurred while notifying listener after job: ${error}`);
        throw error;
      }
    }
  }

  protected async notifyListenersOnError(jobExecution: JobExecution, error: Error): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.onJobError?.(jobExecution, error);
      } catch (error) {
        this.logger.error(`Error occurred while notifying listener on job error: ${error}`);
        throw error;
      }
    }
  }
}
