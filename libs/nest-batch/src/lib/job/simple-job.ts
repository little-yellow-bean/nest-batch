import { ExecutionStatus, JobExecution } from "../execution";
import { Job } from "./job";

export class SimpleJob extends Job {
  override async processSteps(jobId: string) {
    let jobExecution: JobExecution | null;
    for (const step of this.steps) {
      jobExecution = await this.jobRepository.findJobExecutionById(jobId);
      if (!jobExecution) {
        throw new Error(`Job execution ${jobId} not found`);
      }
      if (jobExecution.isStopping()) {
        return ExecutionStatus.STOPPED;
      }
      await step.execute(jobExecution);
    }
    return ExecutionStatus.COMPLETED;
  }
}
