import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { TelegramService } from './telegram.service.js';
import { Public } from '../../iam/decorators/public.decorator.js';
import { loadEnv } from '../../config/env.js';

@Controller('/v1/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('X-Telegram-Bot-Api-Secret-Token') secretToken: string,
    @Body() body: any
  ) {
    const env = loadEnv();
    // Validate secret token if configured
    if (env.TELEGRAM_WEBHOOK_SECRET && secretToken !== env.TELEGRAM_WEBHOOK_SECRET) {
      throw new UnauthorizedException('Invalid secret token');
    }

    if (body.message) {
      await this.telegramService.processMessage(body.message);
    }
    
    return { ok: true };
  }
}
