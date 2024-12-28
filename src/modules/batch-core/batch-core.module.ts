import { DynamicModule, Module } from '@nestjs/common';
import {
  ModuleOptions,
  DEFAULT_MODULE_OPTIONS,
  AsyncModuleOptions,
} from './config';
import { BATCH_CONFIG } from './constants';
import { JobFactory, JobLauncher } from './job';

@Module({})
export class BatchCoreModule {
  static register(options: ModuleOptions = {}): DynamicModule {
    return {
      module: BatchCoreModule,
      providers: [
        {
          provide: BATCH_CONFIG,
          useValue: { ...DEFAULT_MODULE_OPTIONS, ...options },
        },
        JobFactory,
        JobLauncher,
      ],
      exports: [JobLauncher, JobFactory, BATCH_CONFIG],
    };
  }

  static registerAsync({
    inject,
    imports,
    useFactory,
  }: AsyncModuleOptions): DynamicModule {
    return {
      module: BatchCoreModule,
      providers: [
        {
          provide: BATCH_CONFIG,
          useFactory: async (...providers) => {
            const options = await useFactory?.(...providers);
            return { ...DEFAULT_MODULE_OPTIONS, ...options };
          },
          inject,
        },
        JobFactory,
        JobLauncher,
      ],
      exports: [JobLauncher, JobFactory, BATCH_CONFIG],
      imports,
    };
  }
}
