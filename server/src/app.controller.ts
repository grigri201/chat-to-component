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

  private isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private async streamResponse(prompt: string, sessionId: string | undefined, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const { response: stream, sessionId: activeSessionId, isNew } = await this.openaiService.completion(prompt, sessionId);
      
      let buffer = '';
      let isBuffering = false;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          if (!isBuffering && content.includes('[[[')) {
            isBuffering = true;
          }
          
          if (isBuffering) {
            buffer += content;
            if (content.includes(']]]')) {
              res.write(buffer);
              buffer = '';
              isBuffering = false;
            }
          } else {
            res.write(content);
          }
        }
      }

      if (isNew) {
        res.write(`[[[${JSON.stringify({ type: "session", sessionId: activeSessionId })}]]]\n`);
      }
      res.end();
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message
      });
    }
  }

  @Post('completion')
  async getCompletion(
    @Body() body: { prompt: string; sessionId?: string },
    @Res() res: Response
  ) {
    return this.streamResponse(
      body.prompt,
      body.sessionId,
      res
    );
  }
}