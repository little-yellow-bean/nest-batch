import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { NestBatchModule } from 'nest-batch';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Env, env } from './config';
import { GithubApiService } from './services/github-api/github-api.service';
import { GithubBatchService } from './services/github-batch/github-batch.service';
import { MongoJobRepository } from './repository/mongo-job-repository/mongo-job-repository.service';
import {
  JobExecutionModel,
  JobExecutionSchema,
  StepExecutionModel,
  StepExecutionSchema,
} from './models/mongo.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [env],
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService<Env>) => ({
        uri: config.get('mongoConnectionUrl'),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    NestBatchModule.register({
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
  controllers: [AppController],
  providers: [
    AppService,
    GithubApiService,
    GithubBatchService,
    MongoJobRepository,
  ],
})
export class AppModule {}
