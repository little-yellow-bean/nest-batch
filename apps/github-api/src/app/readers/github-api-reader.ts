import { PaginatedReader } from 'nest-batch';
import { GithubRepo } from '../models/github-api';
import { GithubApiService } from '../services/github-api/github-api.service';

const USER_NAME = 'little-yellow-bean';
export class GithubApiReader extends PaginatedReader<GithubRepo> {
  private nextLink: string;
  private hasNext = true;
  constructor(private githubApiService: GithubApiService) {
    super();
  }

  override async readPage(): Promise<GithubRepo[]> {
    if (this.nextLink) {
      const res = await this.githubApiService.requestRepos(this.nextLink);
      this.nextLink = res.links.next;
      this.hasNext = !!this.nextLink;
      return res.data;
    }
    const res = await this.githubApiService.getUserRepos(USER_NAME);
    this.nextLink = res.links.next;
    this.hasNext = !!this.nextLink;
    return res.data;
  }

  override hasNextPage(): boolean {
    return this.hasNext;
  }
}
