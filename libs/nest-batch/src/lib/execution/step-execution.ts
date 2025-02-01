import { BaseExecution, ExecutionOptions } from './base-execution';
import { JobExecution } from './job-execution';

export interface StepExecutionOptions extends ExecutionOptions {
  readCount?: number;
  writeCount?: number;
  commitCount?: number;
  rollbackCount?: number;
  readSkipCount?: number;
  processSkipCount?: number;
  writeSkipCount?: number;
}

export class StepExecution extends BaseExecution {
  jobExecution: JobExecution;

  // Reserving the following properties for future use
  readCount: number;
  writeCount: number;
  commitCount: number;
  rollbackCount: number;
  readSkipCount: number;
  processSkipCount: number;
  writeSkipCount: number;

  constructor({
    readCount,
    writeCount,
    commitCount,
    rollbackCount,
    readSkipCount,
    processSkipCount,
    writeSkipCount,
    ...rest
  }: StepExecutionOptions = {}) {
    super(rest);
    this.readCount = readCount || 0;
    this.writeCount = writeCount || 0;
    this.commitCount = commitCount || 0;
    this.rollbackCount = rollbackCount || 0;
    this.readSkipCount = readSkipCount || 0;
    this.processSkipCount = processSkipCount || 0;
    this.writeSkipCount = writeSkipCount || 0;
  }

  setJobExecution(jobExecution: JobExecution) {
    this.jobExecution = jobExecution;
    return this;
  }

  getJobExecution() {
    return this.jobExecution;
  }

  override from(stepExecution: StepExecution) {
    return super
      .from(stepExecution)
      .setJobExecution(
        new JobExecution().from(stepExecution.getJobExecution())
      );
  }
}
