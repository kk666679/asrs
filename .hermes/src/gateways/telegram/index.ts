import { Gateway, sanitize } from '../types';
import { logger } from '../../config';

export const telegramGateway: Gateway = {
  async sendMessage(channel: string, text: string, metadata?: Record<string, unknown>) {
    logger.info({ gateway: 'telegram', channel: sanitize(channel), metadata }, sanitize(text));
    if (process.env.TELEGRAM_BOT_TOKEN) {
      logger.warn({ gateway: 'telegram' }, 'Telegram Bot API integration pending');
    }
  },
};

/** @deprecated use telegramGateway.sendMessage */
export function sendMessage(channel: string, text: string) {
  telegramGateway.sendMessage(channel, text);
}
