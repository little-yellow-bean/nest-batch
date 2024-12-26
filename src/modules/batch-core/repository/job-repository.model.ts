import { JobExecution, StepExecution, ExecutionStatus } from '../execution';

export interface ExecutionFilter {
  id?: string;
  name?: string;
  statuses?: ExecutionStatus[];
}

interface UpdateExecutionPayload {
  status?: ExecutionStatus;
  endTime?: Date;
  exitStatus?: string;
  failureExceptions?: string[];
  lastUpdatedTime?: Date;
}

export interface UpdateStepExecutionPayload extends UpdateExecutionPayload {}

export interface UpdateJobExecutionPayload extends UpdateExecutionPayload {}

export interface JobRepository {
  saveJobExecution(execution: JobExecution): Promise<JobExecution>;
  saveStepExecution(execution: StepExecution): Promise<StepExecution>;
  updateJobExecution(execution: JobExecution): Promise<JobExecution>;
  updateStepExecution(execution: StepExecution): Promise<StepExecution>;
  updateJobExecutionById(
    id: string,
    payload: UpdateJobExecutionPayload,
  ): Promise<JobExecution>;
  updateStepExecutionById(
    id: string,
    payload: UpdateStepExecutionPayload,
  ): Promise<StepExecution>;
  findJobExecutionById(id: string): Promise<JobExecution | null>;
  findStepExecutionById(id: string): Promise<StepExecution | null>;
  findJobExecutionBy(filter: ExecutionFilter): Promise<JobExecution[]>;
  findStepExecutionBy(filter: ExecutionFilter): Promise<StepExecution[]>;
}
