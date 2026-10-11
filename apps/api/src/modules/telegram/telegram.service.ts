import { Injectable, Logger } from '@nestjs/common';
import { loadEnv } from '../../config/env.js';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async processMessage(message: any) {
    const chatId = message.chat?.id;
    const text = message.text;

    if (!chatId || !text) return;

    this.logger.log(`Received message from ${chatId}: ${text}`);

    // Basic echo or LLM connection stub
    // In a full implementation, this would connect to Gemini and use function calling
    // to query the database (e.g. assignments, work orders)
    await this.sendMessage(chatId, `Procesando solicitud: "${text}"... (LLM Integration Stub)`);
  }

  private async sendMessage(chatId: string, text: string) {
    const env = loadEnv();
    if (!env.TELEGRAM_BOT_TOKEN) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured. Skipping reply.');
      return;
    }

    const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
    } catch (e) {
      this.logger.error('Failed to send telegram message', e);
    }
  }
}
