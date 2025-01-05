import { StepExecution } from '../execution';

export interface StepListener {
  beforeStep?(stepExecution: StepExecution): Promise<void>;
  afterStep?(stepExecution: StepExecution): Promise<void>;
  onStepError?(stepExecution: StepExecution, error: Error): Promise<void>;
}
