import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { GithubApiResponse, GithubRepo } from '../../models/github-api';

@Injectable()
export class GithubApiService {
  private readonly githubApiUrl = 'https://api.github.com';
  constructor(private readonly httpService: HttpService) {}

  async getUserRepos(username: string): Promise<GithubApiResponse<GithubRepo>> {
    try {
      const response = await this.requestRepos(
        `${this.githubApiUrl}/users/${username}/repos`,
      );
      return response;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch GitHub repos',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async requestRepos(url: string): Promise<GithubApiResponse<GithubRepo>> {
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      return {
        data: response.data,
        links: this.buildLinks(response.headers.link),
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch GitHub repos',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildLinks(linkHeader = '') {
    const links = linkHeader.split(',').reduce((acc: any, link: string) => {
      const [url, rel] = link.split(';');
      const relName = rel.trim().replace(/"/g, '').split('=')[1];
      acc[relName] = url.trim().slice(1, -1); // 去除 <> 符号
      return acc;
    }, {});
    return links;
  }
}
