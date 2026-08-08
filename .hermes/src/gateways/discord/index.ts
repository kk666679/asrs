import { Gateway, sanitize } from '../types';
import { logger } from '../../config';

export const discordGateway: Gateway = {
  async sendMessage(channel: string, text: string, metadata?: Record<string, unknown>) {
    const safeChannel = sanitize(channel);
    const safeText = sanitize(text);
    logger.info({ gateway: 'discord', channel: safeChannel, metadata }, safeText);
    if (process.env.DISCORD_BOT_TOKEN) {
      logger.warn({ gateway: 'discord' }, 'Discord client integration pending');
    }
  },
};

/** @deprecated use discordGateway.sendMessage */
export function sendMessage(channel: string, text: string) {
  discordGateway.sendMessage(channel, text);
}
