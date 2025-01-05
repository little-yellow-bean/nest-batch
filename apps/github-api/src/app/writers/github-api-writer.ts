import { Logger } from '@nestjs/common';
import { ItemWriter } from 'nest-batch';
import { GithubRepo } from '../models/github-api';

export class GithubApiWriter implements ItemWriter<GithubRepo> {
  private readonly logger = new Logger(GithubApiWriter.name);
  async write(items: GithubRepo[]): Promise<void> {
    this.logger.log(`writing repos to db: ${items.map((item) => item.name)}`);
  }
}
