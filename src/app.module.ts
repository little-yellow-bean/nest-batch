import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubApiModule } from './modules/github-api/github-api.module';

@Module({
  imports: [GithubApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
