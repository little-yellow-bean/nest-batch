import { DynamicModule, Module } from '@nestjs/common';

import {
  ModuleOptions,
  DEFAULT_MODULE_OPTIONS,
  AsyncModuleOptions,
  BatchConfig,
} from './config';
import { JobFactory, JobLauncher } from './job';

@Module({})
export class NestBatchModule {
  static register(options: ModuleOptions = {}): DynamicModule {
    return {
      module: NestBatchModule,
      providers: [
        {
          provide: BatchConfig,
          useValue: new BatchConfig({ ...DEFAULT_MODULE_OPTIONS, ...options }),
        },
        JobFactory,
        JobLauncher,
      ],
      exports: [JobLauncher, JobFactory, BatchConfig],
    };
  }

  static registerAsync({
    inject,
    imports,
    useFactory,
  }: AsyncModuleOptions): DynamicModule {
    return {
      module: NestBatchModule,
      providers: [
        {
          provide: BatchConfig,
          useFactory: async (...providers) => {
            const options = await useFactory?.(...providers);
            return new BatchConfig({ ...DEFAULT_MODULE_OPTIONS, ...options });
          },
          inject,
        },
        JobFactory,
        JobLauncher,
      ],
      exports: [JobLauncher, JobFactory, BatchConfig],
      imports,
    };
  }
}
