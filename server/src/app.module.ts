import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OpenAIService } from './openai.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, OpenAIService],
})
export class AppModule {}
