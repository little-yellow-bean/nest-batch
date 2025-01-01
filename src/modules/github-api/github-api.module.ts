import { Module } from '@nestjs/common';
import { GithubApiService } from './services/github-api/github-api.service';
import { GithubBatchService } from './services/github-batch/github-batch.service';
import { HttpModule } from '@nestjs/axios';
import { BatchCoreModule } from '../batch-core/batch-core.module';
import { MongoJobRepository } from './repository/mongo-job-repository/mongo-job-repository.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobExecutionModel,
  JobExecutionSchema,
  StepExecutionModel,
  StepExecutionSchema,
} from './models/mongo.schema';

@Module({
  imports: [
    BatchCoreModule.register({
      chunkSize: 2,
      maxRetries: 3,
      retryDelay: 3000,
    }),
    MongooseModule.forFeature([
      { name: JobExecutionModel.name, schema: JobExecutionSchema },
      { name: StepExecutionModel.name, schema: StepExecutionSchema },
    ]),
    HttpModule,
  ],
  providers: [GithubApiService, GithubBatchService, MongoJobRepository],
})
export class GithubApiModule {}
