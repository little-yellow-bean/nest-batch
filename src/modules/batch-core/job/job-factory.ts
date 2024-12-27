import { Inject, Injectable } from '@nestjs/common';
import { BATCH_CONFIG, BATCH_JOB_REPOSITORY } from '../constants';
import { JobRepository } from '../repository';
import { BatchConfig } from '../config';
import { SimpleJob } from './simple-job';
import { ItemReader, PaginableReader } from '../reader';
import { ItemProcessor } from '../processor';
import { ItemWriter } from '../writer';
import { JobListener, StepListener } from '../listener';
import { ChunkOrientedStep, PageOrientedStep } from '../step';
import { Job } from './job';

interface CreateStepPayload<I, O> {
  reader: ItemReader<I>;
  processor?: ItemProcessor<I, O>;
  writer: ItemWriter<O>;
  listeners?: StepListener[];
  chunkSize?: number;
  name: string;
}

@Injectable()
export class JobFactory {
  constructor(
    @Inject(BATCH_JOB_REPOSITORY) private jobRepository: JobRepository,
    @Inject(BATCH_CONFIG) private config: BatchConfig,
  ) {}

  jobBuilder(name: string) {
    const builder = new SimpleJobBuilder(name, this.jobRepository, this.config);
    return builder;
  }
}

class SimpleJobBuilder {
  private readonly job: Job;
  constructor(
    name: string,
    private jobRepository: JobRepository,
    private config: BatchConfig,
  ) {
    this.job = new SimpleJob().setName(name).setJobRepository(jobRepository);
  }

  listeners(listeners: JobListener[]) {
    listeners.forEach((listener) => this.job.addListener(listener));
    return this;
  }

  step<I, O>(step: CreateStepPayload<I, O>) {
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
    name,
  }: CreateStepPayload<I, O>) {
    const step = (
      reader instanceof PaginableReader
        ? new PageOrientedStep()
        : new ChunkOrientedStep()
    )
      .setName(name)
      .setChunkSize(chunkSize || this.config.chunkSize)
      .setJobRepository(this.jobRepository)
      .setReader(reader)
      .setProcessor(processor)
      .setWriter(writer);
    listeners?.forEach((listener) => step.addListener(listener));
    return step;
  }
}
