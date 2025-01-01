import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ItemReader } from '../reader';
import { ItemProcessor } from '../processor';
import { ItemWriter } from '../writer';
import { StepListener } from '../listener';
import { ExecutionStatus, JobExecution, StepExecution } from '../execution';
import { JobRepository } from '../repository';
import { LIB_NAME } from '../constants';
import { sleep } from '../utils';

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
  protected readonly logger = new Logger(LIB_NAME);

  async execute(jobExecution: JobExecution): Promise<StepExecution> {
    if (!this.reader || !this.writer) {
      throw new Error('Reader and writer must be configured');
    }

    if (!this.jobRepository) {
      throw new Error('Job Repository is required');
    }

    if (!this.name?.trim()?.length) {
      throw new Error('Step name is required');
    }

    let stepExecution = new StepExecution()
      .setId(uuid())
      .setCreateTime(new Date())
      .setJobExecution(jobExecution)
      .setName(this.name)
      .transitionStatus(ExecutionStatus.CREATED)
      .setLastUpdatedTime(new Date());

    stepExecution = await this.jobRepository.saveStepExecution(stepExecution);
    await this.notifyListenersBeforeStep(stepExecution);

    stepExecution = await this.jobRepository.updateStepExecution(
      stepExecution
        .transitionStatus(ExecutionStatus.STARTING)
        .setStartTime(new Date())
        .setLastUpdatedTime(new Date()),
    );

    // TODO: Add pre-started works in the future
    stepExecution = await this.jobRepository.updateStepExecution(
      stepExecution
        .transitionStatus(ExecutionStatus.STARTED)
        .setLastUpdatedTime(new Date()),
    );

    let retryCount = 0;
    let lastError: Error;

    do {
      try {
        await this.processItems();
        break;
      } catch (error) {
        if (retryCount < this.maxRetries && this.shouldRetry?.(error)) {
          retryCount++;
          this.logger.warn(
            `Error occurred while executing step ${this.name}: ${error}. Retrying in ${this.retryDelay}ms`,
          );
          await sleep(this.retryDelay);
        } else {
          lastError = error;
          break;
        }
      }
    } while (retryCount <= this.maxRetries);

    if (lastError) {
      stepExecution = await this.jobRepository.updateStepExecution(
        stepExecution
          .transitionStatus(ExecutionStatus.FAILED)
          .setEndTime(new Date())
          .setLastUpdatedTime(new Date())
          .setFailureExceptions([lastError.message]),
      );
      await this.notifyListenersOnError(stepExecution, lastError);
      this.logger.error(`Step ${this.name} failed: ${lastError}`);
      throw lastError;
    }

    stepExecution = await this.jobRepository.updateStepExecution(
      stepExecution
        .transitionStatus(ExecutionStatus.COMPLETED)
        .setEndTime(new Date())
        .setLastUpdatedTime(new Date()),
    );

    await this.notifyListenersAfterStep(stepExecution);
    this.logger.log(`Step ${this.name} completed successfully`);
    return stepExecution;
  }

  protected abstract processItems(): Promise<void>;

  setReader(reader: ItemReader<I>) {
    this.reader = reader;
    return this;
  }

  setProcessor(processor: ItemProcessor<I, O>) {
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

  protected async notifyListenersBeforeStep(
    stepExecution: StepExecution,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.beforeStep?.(stepExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener before step: ${error}`,
        );
      }
    }
  }

  protected async notifyListenersAfterStep(
    stepExecution: StepExecution,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.afterStep?.(stepExecution);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener after step: ${error}`,
        );
      }
    }
  }

  protected async notifyListenersOnError(
    stepExecution: StepExecution,
    error: Error,
  ): Promise<void> {
    for (const listener of this.listeners) {
      try {
        await listener.onStepError?.(stepExecution, error);
      } catch (error) {
        this.logger.error(
          `Error occurred while notifying listener on step error: ${error}`,
        );
      }
    }
  }
}
