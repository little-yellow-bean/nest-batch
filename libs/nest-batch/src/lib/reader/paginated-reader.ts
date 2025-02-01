import { StepExecution } from '../execution';
import { ItemReader } from './item-reader.model';

export abstract class PaginatedReader<T> implements ItemReader<T> {
  async read(stepExecution: StepExecution): Promise<T[] | null> {
    if (!this.hasNextPage()) {
      return null;
    }
    return this.readPage(stepExecution);
  }
  abstract readPage(stepExecution: StepExecution): Promise<T[]>;
  abstract hasNextPage(): boolean;
}
