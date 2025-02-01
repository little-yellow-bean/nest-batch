import { Injectable } from '@nestjs/common';

import type { ModuleOptions } from '../config';

import { BatchConfig } from '../config';
import { JobListener, StepListener } from '../listener';
import { ItemProcessor } from '../processor';
import { ItemReader, PaginatedReader } from '../reader';
import { InMemoryJobRepository, JobRepository } from '../repository';
import { ChunkOrientedStep, PageOrientedStep } from '../step';
import { ItemWriter } from '../writer';
import { Job } from './job';
import { SimpleJob } from './simple-job';

type CreateStepPayload<I, O> = {
  reader: ItemReader<I>;
  processor?: ItemProcessor<I, O>;
  writer: ItemWriter<O>;
  listeners?: StepListener[];
  name: string;
} & ModuleOptions;

@Injectable()
export class JobFactory {
  private readonly defaultJobRepository = new InMemoryJobRepository();
  constructor(private readonly config: BatchConfig) {}

  jobBuilder(name: string) {
    const builder = new SimpleJobBuilder(
      name,
      this.defaultJobRepository,
      this.config
    );
    return builder;
  }
}

class SimpleJobBuilder {
  private readonly job: Job;
  constructor(
    name: string,
    private jobRepository: JobRepository,
    private readonly config: BatchConfig
  ) {
    this.job = new SimpleJob(name).setJobRepository(jobRepository);
  }

  repository(repository: JobRepository) {
    this.jobRepository = repository;
    this.job.setJobRepository(this.jobRepository);
    this.job
      .getSteps()
      .forEach((step) => step.setJobRepository(this.jobRepository));
    return this;
  }

  listeners(listeners: JobListener[]) {
    listeners.forEach((listener) => this.job.addListener(listener));
    return this;
  }

  addStep<I, O>(step: CreateStepPayload<I, O>) {
    this.job.addStep(this.createStep(step));
    return this;
  }

  build() {
    return this.job;
  }

  private createStep<I, O>({
    reader,
    processor,
    writer,
    listeners,
    chunkSize,
    maxRetries,
    retryDelay,
    shouldRetry,
    parallelProcessing,
    name,
  }: CreateStepPayload<I, O>) {
    const step = (
      reader instanceof PaginatedReader
        ? new PageOrientedStep(name)
        : new ChunkOrientedStep(name)
    )
      .setChunkSize(chunkSize || this.config.options.chunkSize)
      .setMaxretries(maxRetries || this.config.options.maxRetries)
      .setRetryDelay(retryDelay || this.config.options.retryDelay)
      .setShouldRetry(shouldRetry || this.config.options.shouldRetry)
      .setParallelProcessing(
        parallelProcessing ?? this.config.options.parallelProcessing
      )
      .setJobRepository(this.jobRepository)
      .setReader(reader)
      .setProcessor(processor)
      .setWriter(writer);
    listeners?.forEach((listener) => step.addListener(listener));
    return step;
  }
}
