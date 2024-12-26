import { BaseExecution } from './base-execution';
import { JobExecution } from './job-execution';

export class StepExecution extends BaseExecution {
  private jobExecution: JobExecution;

  // Reserving the following properties for future use
  private readCount: number;
  private writeCount: number;
  private commitCount: number;
  private rollbackCount: number;
  private readSkipCount: number;
  private processSkipCount: number;
  private writeSkipCount: number;

  setJobExecution(jobExecution: JobExecution) {
    this.jobExecution = jobExecution;
    return this;
  }

  getJobExecution() {
    return this.jobExecution;
  }

  override from(stepExecution: StepExecution) {
    super.from(stepExecution);
    this.jobExecution = new JobExecution().from(stepExecution.jobExecution);
    return this;
  }
}
