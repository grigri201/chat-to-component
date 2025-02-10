import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { OpenAIService } from './openai.service';

@Controller()
export class AppController {
  constructor(private readonly openaiService: OpenAIService) {}

  @Get('stats')
  getStats() {
    return this.openaiService.getStats();
  }

  private async streamResponse(prompt: string, systemPrompt: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = await this.openaiService.completion(prompt, systemPrompt);
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      }
      res.end();
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message
      });
    }
  }

  @Post('completion')
  async getCompletion(@Body() body: { prompt: string }, @Res() res: Response) {
    return this.streamResponse(
      body.prompt,
      'You are a helpful AI assistant. Respond in a clear and concise manner.',
      res
    );
  }

  @Post('search')
  async getSearch(@Body() body: { prompt: string }, @Res() res: Response) {
    return this.streamResponse(
      body.prompt,
      'You are a search assistant. Focus on finding and presenting relevant information from the web. Format your response with clear sections and bullet points when appropriate.',
      res
    );
  }

  @Post('reason')
  async getReason(@Body() body: { prompt: string }, @Res() res: Response) {
    return this.streamResponse(
      body.prompt,
      'You are a reasoning assistant. Break down complex problems and explain your thought process step by step. Consider multiple perspectives and provide detailed analysis.',
      res
    );
  }
}