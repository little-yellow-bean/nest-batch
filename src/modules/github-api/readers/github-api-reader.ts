import { ItemReader } from 'src/modules/batch-core/reader';
import { GithubRepo } from '../models/github-api';
import { GithubApiService } from '../services/github-api/github-api.service';

export class GithubApiReader implements ItemReader<GithubRepo> {
  private nextLink: string;
  private hasNext = true;
  constructor(private githubApiService: GithubApiService) {}
  async read(): Promise<GithubRepo[]> {
    if (!this.hasNext) {
      return null;
    }
    if (this.nextLink) {
      const res = await this.githubApiService.requestRepos(this.nextLink);
      this.nextLink = res.links.next;
      this.hasNext = !!this.nextLink;
      return res.data;
    }
    const res = await this.githubApiService.getUserRepos('little-yellow-bean');
    this.nextLink = res.links.next;
    this.hasNext = !!this.nextLink;
    return res.data;
  }
}
