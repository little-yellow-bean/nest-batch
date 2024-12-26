export interface ItemWriter<T> {
  write(items: T[]): Promise<void>;
}
