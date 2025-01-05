import { ItemReader } from './item-reader.model';

export abstract class PaginableReader<T> implements ItemReader<T> {
  read(): Promise<T[]> {
    if (!this.hasNextPage()) {
      return null;
    }
    return this.readPage();
  }
  abstract readPage(): Promise<T[]>;
  abstract hasNextPage(): boolean;
}
