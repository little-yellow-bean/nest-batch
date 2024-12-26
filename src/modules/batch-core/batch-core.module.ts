import { DynamicModule, Module } from '@nestjs/common';
import { ModuleOptions, DEFAULT_MODULE_OPTIONS } from './config';
import { BATCH_CONFIG, BATCH_JOB_REPOSITORY } from './constants';
import { JobFactory, JobLauncher } from './job';

@Module({})
export class BatchCoreModule {
  static register(options: ModuleOptions = {}): DynamicModule {
    const { repository, ...rest } = options;
    const { repository: defaultRepositiory, ...defaultRest } =
      DEFAULT_MODULE_OPTIONS;

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
