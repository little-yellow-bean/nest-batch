import { JobExecution, StepExecution, ExecutionStatus } from '../execution';

export interface ExecutionFilter {
  id?: string;
  name?: string;
  statuses?: ExecutionStatus[];
}

export interface JobRepository {
  saveJobExecution(execution: JobExecution): Promise<JobExecution>;
  saveStepExecution(execution: StepExecution): Promise<StepExecution>;
  updateJobExecution(execution: JobExecution): Promise<JobExecution>;
  updateStepExecution(execution: StepExecution): Promise<StepExecution>;
  findJobExecutionById(id: string): Promise<JobExecution | null>;
  findStepExecutionById(id: string): Promise<StepExecution | null>;
  findJobExecutionBy(filter: ExecutionFilter): Promise<JobExecution[]>;
  findStepExecutionBy(filter: ExecutionFilter): Promise<StepExecution[]>;
}
