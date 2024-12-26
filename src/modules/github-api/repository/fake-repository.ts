import { JobExecution, StepExecution } from 'src/modules/batch-core/execution';
import {
  ExecutionFilter,
  JobRepository,
  UpdateJobExecutionPayload,
  UpdateStepExecutionPayload,
} from 'src/modules/batch-core/repository';

export class FakeRepository implements JobRepository {
  saveJobExecution(execution: JobExecution): Promise<JobExecution> {
    throw new Error('Method not implemented.');
  }
  saveStepExecution(execution: StepExecution): Promise<StepExecution> {
    throw new Error('Method not implemented.');
  }
  updateJobExecution(execution: JobExecution): Promise<JobExecution> {
    throw new Error('Method not implemented.');
  }
  updateStepExecution(execution: StepExecution): Promise<StepExecution> {
    throw new Error('Method not implemented.');
  }
  updateJobExecutionById(
    id: string,
    payload: UpdateJobExecutionPayload,
  ): Promise<JobExecution> {
    throw new Error('Method not implemented.');
  }
  updateStepExecutionById(
    id: string,
    payload: UpdateStepExecutionPayload,
  ): Promise<StepExecution> {
    throw new Error('Method not implemented.');
  }
  findJobExecutionById(id: string): Promise<JobExecution | null> {
    throw new Error('Method not implemented.');
  }
  findStepExecutionById(id: string): Promise<StepExecution | null> {
    throw new Error('Method not implemented.');
  }
  findJobExecutionBy(filter: ExecutionFilter): Promise<JobExecution[]> {
    throw new Error('Method not implemented.');
  }
  findStepExecutionBy(filter: ExecutionFilter): Promise<StepExecution[]> {
    throw new Error('Method not implemented.');
  }
}
