import { Module } from '@nestjs/common';
import { GithubApiService } from './services/github-api/github-api.service';
import { GithubBatchService } from './services/github-batch/github-batch.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { env } from './config';
import { BatchCoreModule } from '../batch-core/batch-core.module';
import { MongoJobRepository } from './repository/mongo-job-repository/mongo-job-repository.service';

@Module({
  imports: [
    BatchCoreModule.register({
      chunkSize: 2,
    }),
    HttpModule,
    ConfigModule.forRoot({
      load: [env],
    }),
  ],
  providers: [GithubApiService, GithubBatchService, MongoJobRepository],
})
export class GithubApiModule {}
