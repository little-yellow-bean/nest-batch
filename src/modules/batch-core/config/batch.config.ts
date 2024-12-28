import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

export const DEFAULT_CHUNK_SIZE = 10;
export interface ModuleOptions {
  maxRetries?: number;
  retryDelay?: number;
  chunkSize?: number;
}

export interface AsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...providers: any[]) => Promise<ModuleOptions> | ModuleOptions;
  inject?: FactoryProvider['inject'];
}

export const DEFAULT_MODULE_OPTIONS: ModuleOptions = {
  maxRetries: 0,
  retryDelay: 0,
  chunkSize: DEFAULT_CHUNK_SIZE,
};
