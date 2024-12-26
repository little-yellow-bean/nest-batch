import { Inject, Injectable } from '@nestjs/common';
import { BATCH_CONFIG, BATCH_JOB_REPOSITORY } from '../constants';
import { JobRepository } from '../repository';
import { BatchConfig } from '../config';
import { SimpleJob } from './simple-job';
import { ItemReader } from '../reader';
import { ItemProcessor } from '../processor';
import { ItemWriter } from '../writer';
import { JobListener, StepListener } from '../listener';
import { PageOrientedStep } from '../step';

interface CreateStepPayload<I, O> {
  reader: ItemReader<I>;
  processor?: ItemProcessor<I, O>;
  writer: ItemWriter<O>;
  listeners?: StepListener[];
  chunkSize?: number;
  name: string;
}
interface CreateJobPayload {
  name: string;
  steps: CreateStepPayload<any, any>[];
  listeners?: JobListener[];
}

@Injectable()
export class JobFactory {
  constructor(
    @Inject(BATCH_JOB_REPOSITORY) private jobRepository: JobRepository,
    @Inject(BATCH_CONFIG) private config: BatchConfig,
  ) {}

  createJob({ name, steps: stepsConfig, listeners }: CreateJobPayload) {
    const job = new SimpleJob()
      .setName(name)
      .setJobRepository(this.jobRepository);
    listeners?.forEach((listener) => job.addListener(listener));
    const steps = stepsConfig.map((stepConfig) => this.createStep(stepConfig));
    steps.forEach((step) => job.addStep(step));
    return job;
  }

  private createStep(stepConfig: CreateStepPayload<any, any>) {
    const { reader, processor, writer, listeners, chunkSize, name } =
      stepConfig;
    const step = new PageOrientedStep()
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
