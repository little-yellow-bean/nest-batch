import { Logger } from '@nestjs/common';

import { LIB_NAME } from '../constants';
import { ExecutionStatus, JobExecution, StepExecution } from '../execution';
import { StepListener } from '../listener';
import { ItemProcessor } from '../processor';
import { ItemReader } from '../reader';
import { JobRepository } from '../repository';
import { sleep } from '../utils';
import { ItemWriter } from '../writer';

export abstract class Step<I, O> {
  protected reader: ItemReader<I>;
  protected processor?: ItemProcessor<I, O>;
  protected writer: ItemWriter<O>;
  protected listeners: StepListener[] = [];
  protected chunkSize: number;
  protected maxRetries: number;
  protected retryDelay: number;
  protected shouldRetry: (error: Error) => boolean;
  protected name: string;
  protected jobRepository: JobRepository;
  protected parallelProcessing: boolean;
  protected readonly logger = new Logger(LIB_NAME);

  constructor(name: string) {
    if (!name.trim().length) {
      throw new Error('Step name is required and cannot be empty');
    }
    this.name = name;
  }

  async execute(jobExecution: JobExecution): Promise<StepExecution> {
    let stepExecution = new StepExecution({ name: this.name }).setJobExecution(
      jobExecution
    );

    try {
      stepExecution = await this.jobRepository.saveStepExecution(stepExecution);
      await this.notifyListenersBeforeStep(stepExecution);

      stepExecution = await this.jobRepository.updateStepExecution(
        stepExecution
          .transitionStatus(ExecutionStatus.STARTING)
          .setStartTime(new Date())
          .setLastUpdatedTime(new Date())
      );

      // TODO: Add pre-started works in the future
      stepExecution = await this.jobRepository.updateStepExecution(
        stepExecution
          .transitionStatus(ExecutionStatus.STARTED)
          .setLastUpdatedTime(new Date())
      );

      let retryCount = 0;
      let lastError: Error | undefined;

      do {
        try {
          await this.processItems(stepExecution);
          break;
        } catch (error) {
          if (
            retryCount < this.maxRetries &&
            this.shouldRetry(error as Error)
          ) {
            retryCount++;
            this.logger.warn(
              `Error occurred while executing step ${this.name}: ${error}. Retrying in ${this.retryDelay}ms`
            );
            await sleep(this.retryDelay);
          } else {
            lastError = error as Error;
            break;
          }
        }
      } while (retryCount <= this.maxRetries);

      if (lastError) {
        throw lastError;
      }

      stepExecution = await this.jobRepository.updateStepExecution(
        stepExecution
          .transitionStatus(ExecutionStatus.COMPLETED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
      );

      await this.notifyListenersAfterStep(stepExecution);
      this.logger.log(`Step ${this.name} completed successfully`);
      return stepExecution;
    } catch (error) {
      stepExecution = await this.jobRepository.updateStepExecution(
        stepExecution
          .transitionStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .setFailureExceptions([(error as Error).message])
      );
      await this.notifyListenersOnError(stepExecution, error as Error);
      this.logger.error(`Step ${this.name} failed: ${error}`);
      throw error;
    }
  }

  protected abstract processItems(stepExecution: StepExecution): Promise<void>;

  setReader(reader: ItemReader<I>) {
    this.reader = reader;
    return this;
  }

  setProcessor(processor: ItemProcessor<I, O> | undefined) {
    this.processor = processor;
    return this;
  }

  setWriter(writer: ItemWriter<O>) {
    this.writer = writer;
    return this;
  }

  setChunkSize(chunkSize: number) {
    if (chunkSize <= 0) {
      throw new Error('Chunk size must be greater than 0');
    }
    this.chunkSize = chunkSize;
    return this;
  }

  setMaxretries(maxRetries: number) {
    if (maxRetries < 0) {
      throw new Error('Max retries must be greater than or equal to 0');
    }
    this.maxRetries = maxRetries;
    return this;
  }

  setRetryDelay(retryDelay: number) {
    if (retryDelay < 0) {
      throw new Error('Retry delay must be greater than or equal to 0');
    }
    this.retryDelay = retryDelay;
    return this;
  }

  setShouldRetry(shouldRetry: (error: Error) => boolean) {
    this.shouldRetry = shouldRetry;
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

  addListener(listener: StepListener) {
    this.listeners.push(listener);
    return this;
  }

  setParallelProcessing(parallelProcessing: boolean) {
    this.parallelProcessing = parallelProcessing;
    return this;
  }

  protected async notifyListenersBeforeStep(
    stepExecution: StepExecution
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.beforeStep?.(stepExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener before step: ${error}`
        );
        throw error;
      }
    }
  }

  protected async notifyListenersAfterStep(
    stepExecution: StepExecution
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.afterStep?.(stepExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener after step: ${error}`
        );
        throw error;
      }
    }
  }

  protected async notifyListenersOnError(
    stepExecution: StepExecution,
    error: Error
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.onStepError?.(stepExecution, error);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener on step error: ${error}`
        );
        throw error;
      }
    }
  }
}
