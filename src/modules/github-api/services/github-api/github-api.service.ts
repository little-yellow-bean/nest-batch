import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GithubApiService {
  private readonly githubApiUrl = 'https://api.github.com';
  constructor(private readonly httpService: HttpService) {
    this.getUserRepos('Yuqi94666').then((data) => console.log(data));
  }

  async getUserRepos(username: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.githubApiUrl}/users/${username}/repos`),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'Failed to fetch GitHub repos',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
