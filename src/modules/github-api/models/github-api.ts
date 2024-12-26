export interface GithubApiResponse<T> {
  data: T[];
  links: {
    next: string;
    last: string;
  };
}

export interface GithubRepo {
  id: number;
  name: string;
  private: boolean;
  forks_count: number;
  stargazers_count: number;
}
