import { DynamicModule, Module } from '@nestjs/common';
import { BatchConfig, DEFAULT_BATCH_CONFIG } from './config';
import { BATCH_CONFIG, BATCH_JOB_REPOSITORY } from './constants';
import { JobLauncher } from './job/job-launcher';
import { JobFactory } from './job/job-factory';

@Module({})
export class BatchCoreModule {
  static register(config: BatchConfig = {}): DynamicModule {
    const { repository, ...rest } = config;
    const { repository: defaultRepositiory, ...defaultRest } =
      DEFAULT_BATCH_CONFIG;

    return {
      module: BatchCoreModule,
      providers: [
        {
          provide: BATCH_CONFIG,
          useValue: { ...defaultRest, ...rest },
        },
        {
          provide: BATCH_JOB_REPOSITORY,
          useClass: repository || defaultRepositiory,
        },
        JobFactory,
        JobLauncher,
      ],
      exports: [JobLauncher, JobFactory, BATCH_JOB_REPOSITORY],
    };
  }
}
