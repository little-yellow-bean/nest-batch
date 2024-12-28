import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubApiModule } from './modules/github-api/github-api.module';
import { Env, env } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [env],
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService<Env>) => ({
        uri: config.get('mongoConnectionUrl'),
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    GithubApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
