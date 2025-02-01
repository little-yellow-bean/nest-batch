import { BaseExecution, ExecutionOptions } from './base-execution';

export interface JobExecutionOptions extends ExecutionOptions {
  jobParameters?: Record<string, unknown>;
}

export class JobExecution extends BaseExecution {
  private jobParameters: Record<string, unknown> = {};

  constructor({ jobParameters, ...rest }: JobExecutionOptions = {}) {
    super(rest);
    this.setJobParameters(jobParameters);
  }

  getJobParameters() {
    return structuredClone(this.jobParameters);
  }

  setJobParameters(jobParameters: Record<string, unknown> = {}) {
    this.jobParameters = structuredClone(jobParameters);
    return this;
  }

  override from(execution: JobExecution) {
    return super.from(execution).setJobParameters(execution.getJobParameters());
  }
}
