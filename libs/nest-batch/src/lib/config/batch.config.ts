import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const DEFAULT_CHUNK_SIZE = 10;

interface _ModuleOptions {
  maxRetries?: number;
  retryDelay?: never;
  shouldRetry?: never;
  chunkSize?: number;
}

interface ModuleOptionsWithRetry
  extends Omit<_ModuleOptions, 'retryDelay' | 'shouldRetry'> {
  maxRetries: number;
  retryDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

export type ModuleOptions = _ModuleOptions | ModuleOptionsWithRetry;

export interface AsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...providers: any[]) => Promise<ModuleOptions> | ModuleOptions;
  inject?: FactoryProvider['inject'];
}

export const DEFAULT_MODULE_OPTIONS: ModuleOptions = {
  maxRetries: 0,
  retryDelay: 0,
  shouldRetry: (error) => !!error,
  chunkSize: DEFAULT_CHUNK_SIZE,
};
