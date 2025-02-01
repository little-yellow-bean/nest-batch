import { Injectable } from '@nestjs/common';

import { Job } from './job';

@Injectable()
export class JobLauncher {
  async run(job: Job, parameters: Record<string, unknown> = {}) {
    const execution = await job.execute(parameters);
    return execution;
  }
}
