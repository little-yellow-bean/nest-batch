import { Injectable } from '@nestjs/common';
import { Job } from './job';

@Injectable()
export class JobLauncher {
  async run(job: Job, parameters: Record<string, any>) {
    const execution = await job.execute(parameters);
    return execution;
  }

  // TODO
  async stop(executionId: string) {
    throw new Error('Not implemented');
  }

  // TODO
  async pause(executionId: string) {
    throw new Error('Not implemented');
  }

  // TODO
  async resume(executionId: string) {
    throw new Error('Not implemented');
  }
}
