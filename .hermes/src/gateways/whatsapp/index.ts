import { Gateway, sanitize } from '../types';
import { logger } from '../../config';

export const whatsappGateway: Gateway = {
  async sendMessage(channel: string, text: string, metadata?: Record<string, unknown>) {
    logger.info({ gateway: 'whatsapp', channel: sanitize(channel), metadata }, sanitize(text));
    if (process.env.WHATSAPP_API_TOKEN) {
      logger.warn({ gateway: 'whatsapp' }, 'WhatsApp Cloud API integration pending');
    }
  },
};

/** @deprecated use whatsappGateway.sendMessage */
export function sendMessage(channel: string, text: string) {
  whatsappGateway.sendMessage(channel, text);
}
