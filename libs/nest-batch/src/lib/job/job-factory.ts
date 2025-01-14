import { Inject, Injectable } from '@nestjs/common';
import { BATCH_CONFIG } from '../constants';
import { InMemoryJobRepository, JobRepository } from '../repository';
import { ModuleOptions } from '../config';
import { SimpleJob } from './simple-job';
import { ItemReader, PaginableReader } from '../reader';
import { ItemProcessor } from '../processor';
import { ItemWriter } from '../writer';
import { JobListener, StepListener } from '../listener';
import { ChunkOrientedStep, PageOrientedStep } from '../step';
import { Job } from './job';

type CreateStepPayload<I, O> = {
  reader: ItemReader<I>;
  processor?: ItemProcessor<I, O>;
  writer: ItemWriter<O>;
  listeners?: StepListener[];
  name: string;
} & ModuleOptions;

@Injectable()
export class JobFactory {
  private readonly defaultJobRepositiory = new InMemoryJobRepository();
  constructor(@Inject(BATCH_CONFIG) private readonly config: ModuleOptions) {}

  jobBuilder(name: string) {
    const builder = new SimpleJobBuilder(
      name,
      this.defaultJobRepositiory,
      this.config,
    );
    return builder;
  }
}

class SimpleJobBuilder {
  private readonly job: Job;
  constructor(
    name: string,
    private jobRepository: JobRepository,
    private readonly config: ModuleOptions,
  ) {
    this.job = new SimpleJob().setName(name).setJobRepository(jobRepository);
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
    name,
  }: CreateStepPayload<I, O>) {
    const step = (
      reader instanceof PaginableReader
        ? new PageOrientedStep()
        : new ChunkOrientedStep()
    )
      .setName(name)
      .setChunkSize(chunkSize || this.config.chunkSize)
      .setMaxretries(maxRetries || this.config.maxRetries)
      .setRetryDelay(retryDelay || this.config.retryDelay)
      .setShouldRetry(shouldRetry || this.config.shouldRetry)
      .setJobRepository(this.jobRepository)
      .setReader(reader)
      .setProcessor(processor)
      .setWriter(writer);
    listeners?.forEach((listener) => step.addListener(listener));
    return step;
  }
}
