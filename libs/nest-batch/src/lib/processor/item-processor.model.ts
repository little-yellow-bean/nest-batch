import { StepExecution } from '../execution';

export interface ItemProcessor<I, O> {
  process(item: I, stepExecution: StepExecution): Promise<O | null>;
}
