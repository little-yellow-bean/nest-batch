import { JobExecution, StepExecution } from '../../execution';
import {
  JobRepository,
  ExecutionFilter,
  UpdateJobExecutionPayload,
  UpdateStepExecutionPayload,
} from '../job-repository.model';

export class InMemoryJobRepository implements JobRepository {
  private jobExecutions: Map<string, JobExecution> = new Map();
  private stepExecutions: Map<string, StepExecution> = new Map();

  async saveJobExecution(execution: JobExecution) {
    this.jobExecutions.set(
      execution.getId(),
      new JobExecution().from(execution),
    );
    return execution;
  }
  async saveStepExecution(execution: StepExecution) {
    this.stepExecutions.set(
      execution.getId(),
      new StepExecution().from(execution),
    );
    return execution;
  }
  async updateJobExecution(execution: JobExecution) {
    this.jobExecutions.set(
      execution.getId(),
      new JobExecution().from(execution),
    );
    return execution;
  }
  async updateStepExecution(execution: StepExecution) {
    this.stepExecutions.set(
      execution.getId(),
      new StepExecution().from(execution),
    );
    return execution;
  }

  async updateJobExecutionById(
    id: string,
    {
      status,
      endTime,
      exitStatus,
      failureExceptions,
      lastUpdatedTime,
    }: UpdateJobExecutionPayload,
  ): Promise<JobExecution> {
    const copy = await this.findJobExecutionById(id);
    if (!copy) {
      throw new Error('Job execution not found');
    }
    if (status) {
      copy.setStatus(status);
    }
    if (endTime) {
      copy.setEndTime(endTime);
    }
    if (exitStatus) {
      copy.setExitStatus(exitStatus);
    }
    if (failureExceptions) {
      copy.setFailureExceptions(failureExceptions);
    }
    if (lastUpdatedTime) {
      copy.setLastUpdatedTime(lastUpdatedTime);
    }
    return this.updateJobExecution(copy);
  }

  async updateStepExecutionById(
    id: string,
    {
      status,
      endTime,
      exitStatus,
      failureExceptions,
      lastUpdatedTime,
    }: UpdateStepExecutionPayload,
  ): Promise<StepExecution> {
    const copy = await this.findStepExecutionById(id);
    if (!copy) {
      throw new Error('Step execution not found');
    }
    if (status) {
      copy.setStatus(status);
    }
    if (endTime) {
      copy.setEndTime(endTime);
    }
    if (exitStatus) {
      copy.setExitStatus(exitStatus);
    }
    if (failureExceptions) {
      copy.setFailureExceptions(failureExceptions);
    }
    if (lastUpdatedTime) {
      copy.setLastUpdatedTime(lastUpdatedTime);
    }
    return this.updateStepExecution(copy);
  }

  async findJobExecutionById(id: string) {
    return new JobExecution().from(this.jobExecutions.get(id));
  }
  async findStepExecutionById(id: string) {
    return new StepExecution().from(this.stepExecutions.get(id));
  }
  async findJobExecutionBy({ id, name, statuses }: ExecutionFilter) {
    const allJobExecutions = [...this.jobExecutions.values()];
    const filtered = allJobExecutions.filter((jobExecution) => {
      if (id && jobExecution.getId() !== id) {
        return false;
      }
      if (name && jobExecution.getName() !== name) {
        return false;
      }
      if (statuses?.length && !statuses.includes(jobExecution.getStatus())) {
        return false;
      }
      return true;
    });
    return filtered.map((jobExecution) =>
      new JobExecution().from(jobExecution),
    );
  }
  async findStepExecutionBy({
    id,
    name,
    statuses,
  }: ExecutionFilter): Promise<StepExecution[]> {
    const allStepExecutions = [...this.stepExecutions.values()];
    const filtered = allStepExecutions.filter((stepExecution) => {
      if (id && stepExecution.getId() !== id) {
        return false;
      }
      if (name && stepExecution.getName() !== name) {
        return false;
      }
      if (statuses?.length && !statuses.includes(stepExecution.getStatus())) {
        return false;
      }
      return true;
    });
    return filtered.map((stepExecution) =>
      new StepExecution().from(stepExecution),
    );
  }
}
