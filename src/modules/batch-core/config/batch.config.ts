import { Type } from '@nestjs/common';
import { InMemoryJobRepository, JobRepository } from '../repository';

export const DEFAULT_CHUNK_SIZE = 10;
export interface BatchConfig {
  maxRetries?: number;
  retryDelay?: number;
  chunkSize?: number;
}

export interface ModuleOptions extends BatchConfig {
  repository?: Type<JobRepository>;
}

export const DEFAULT_MODULE_OPTIONS: ModuleOptions = {
  maxRetries: 0,
  retryDelay: 0,
  chunkSize: DEFAULT_CHUNK_SIZE,
  repository: InMemoryJobRepository,
};
