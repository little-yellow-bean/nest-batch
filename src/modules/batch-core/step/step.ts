import { Logger } from '@nestjs/common';
import { ItemReader } from '../reader';
import { ItemProcessor } from '../processor';
import { ItemWriter } from '../writer';
import { StepListener } from '../listener';
import { JobExecution, StepExecution } from '../execution';
import { JobRepository } from '../repository';
import { LIB_NAME } from '../constants';

export abstract class Step<I, O> {
  protected reader: ItemReader<I>;
  protected processor?: ItemProcessor<I, O>;
  protected writer: ItemWriter<O>;
  protected listeners: StepListener[] = [];
  protected chunkSize: number;
  protected name: string;
  protected jobRepository: JobRepository;
  protected readonly logger = new Logger(LIB_NAME);

  abstract execute(jobExecution: JobExecution): Promise<StepExecution>;

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
