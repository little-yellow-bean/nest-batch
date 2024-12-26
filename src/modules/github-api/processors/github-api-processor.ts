import { ItemProcessor } from 'src/modules/batch-core/processor';
import { GithubRepo } from '../models/github-api';
import { Logger } from '@nestjs/common';

export class GithubApiProcessor
  implements ItemProcessor<GithubRepo, GithubRepo>
{
  private readonly logger = new Logger(GithubApiProcessor.name);
  async process(item: GithubRepo): Promise<GithubRepo> {
    this.logger.log(`Processing repo: ${item.name}`);
    if (!item.forks_count && !item.stargazers_count) {
      return null;
    }
    return item;
  }
}
