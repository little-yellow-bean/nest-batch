export interface ItemReader<T> {
  read(): Promise<T[] | null>;
}
