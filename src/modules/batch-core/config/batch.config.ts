import { Type } from '@nestjs/common';
import { InMemoryJobRepository, JobRepository } from '../repository';

export const DEFAULT_CHUNK_SIZE = 10;
export interface BatchConfig {
  maxRetries?: number;
  retryDelay?: number;
  repository?: Type<JobRepository>;
  chunkSize?: number;
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxRetries: 0,
  retryDelay: 0,
  chunkSize: DEFAULT_CHUNK_SIZE,
  repository: InMemoryJobRepository,
};
