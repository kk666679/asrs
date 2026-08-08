import { Gateway, sanitize } from '../types';
import { logger } from '../../config';

export const emailGateway: Gateway = {
  async sendMessage(channel: string, text: string, metadata?: Record<string, unknown>) {
    logger.info({ gateway: 'email', to: sanitize(channel), metadata }, sanitize(text));
    if (process.env.SMTP_HOST) {
      logger.warn({ gateway: 'email' }, 'Nodemailer/SES integration pending');
    }
  },
};

/** @deprecated use emailGateway.sendMessage */
export function sendMessage(channel: string, text: string) {
  emailGateway.sendMessage(channel, text);
}
