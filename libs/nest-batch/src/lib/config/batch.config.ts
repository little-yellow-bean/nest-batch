import { FactoryProvider, ModuleMetadata, Provider } from '@nestjs/common';

export const DEFAULT_CHUNK_SIZE = 10;

interface ModuleOptionsWithoutRetry {
  maxRetries?: number;
  retryDelay?: never;
  shouldRetry?: never;
  chunkSize?: number;
  parallelProcessing?: boolean;
}

interface ModuleOptionsWithRetry
  extends Omit<ModuleOptionsWithoutRetry, 'retryDelay' | 'shouldRetry'> {
  maxRetries: number;
  retryDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

export type ModuleOptions = ModuleOptionsWithoutRetry | ModuleOptionsWithRetry;

export class BatchConfig {
  constructor(public readonly options: ModuleOptions) {}
}

export interface AsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: <T extends Provider[]>(
    ...providers: T
  ) => Promise<ModuleOptions> | ModuleOptions;
  inject?: FactoryProvider['inject'];
}

export const DEFAULT_MODULE_OPTIONS: ModuleOptions = {
  maxRetries: 0,
  retryDelay: 0,
  shouldRetry: (error) => !!error,
  chunkSize: DEFAULT_CHUNK_SIZE,
  parallelProcessing: false,
};
