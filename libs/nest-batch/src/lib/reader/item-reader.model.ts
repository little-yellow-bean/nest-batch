import { StepExecution } from '../execution';

export interface ItemReader<T> {
  read(stepExecution: StepExecution): Promise<T[] | null>;
}
