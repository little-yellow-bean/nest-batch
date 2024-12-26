import { Module } from '@nestjs/common';
import { BatchCoreModule } from '../batch-core/batch-core.module';
import { GithubApiService } from './services/github-api/github-api.service';
import { GithubBatchService } from './services/github-batch/github-batch.service';
import { HttpModule } from '@nestjs/axios';
// import { FakeRepository } from './repository/fake-repository';

@Module({
  imports: [
    BatchCoreModule.register({
      chunkSize: 2,
      // repository: FakeRepository,
    }),
    HttpModule,
  ],
  providers: [GithubApiService, GithubBatchService],
})
export class GithubApiModule {}
