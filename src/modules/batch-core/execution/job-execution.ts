import { BaseExecution } from './base-execution';

export class JobExecution extends BaseExecution {
  private jobParameters: Record<string, any> = {};

  getJobParameters() {
    return structuredClone(this.jobParameters);
  }

  setJobParameters(jobParameters: Record<string, any> = {}) {
    this.jobParameters = structuredClone(jobParameters);
    return this;
  }

  override from(execution: JobExecution) {
    super.from(execution);
    return this.setJobParameters(execution.getJobParameters());
  }
}
