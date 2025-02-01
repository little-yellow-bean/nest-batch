import { StepExecution } from '../execution';

export interface ItemWriter<T> {
  write(items: T[], stepExecution: StepExecution): Promise<void>;
}
