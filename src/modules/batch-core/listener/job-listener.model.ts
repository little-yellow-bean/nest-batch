import { JobExecution } from '../execution';

export interface JobListener {
  beforeJob?(jobExecution: JobExecution): Promise<void>;
  afterJob?(jobExecution: JobExecution): Promise<void>;
  onJobError?(jobExecution: JobExecution, error: Error): Promise<void>;
}
