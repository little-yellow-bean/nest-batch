export const DEFAULT_CHUNK_SIZE = 10;
export interface BatchConfig {
  maxRetries?: number;
  retryDelay?: number;
  chunkSize: number;
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxRetries: 0,
  retryDelay: 0,
  chunkSize: DEFAULT_CHUNK_SIZE,
};
