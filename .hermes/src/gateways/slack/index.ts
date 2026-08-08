import { Gateway, sanitize } from '../types';
import { logger } from '../../config';

export const slackGateway: Gateway = {
  async sendMessage(channel: string, text: string, metadata?: Record<string, unknown>) {
    const safeChannel = sanitize(channel);
    const safeText = sanitize(text);
    logger.info({ gateway: 'slack', channel: safeChannel, metadata }, safeText);
    // TODO: integrate @slack/web-api WebClient when SLACK_BOT_TOKEN is set
    if (process.env.SLACK_BOT_TOKEN) {
      logger.warn({ gateway: 'slack' }, 'Slack WebClient integration pending');
    }
  },
};

/** @deprecated use slackGateway.sendMessage */
export function sendMessage(channel: string, text: string) {
  slackGateway.sendMessage(channel, text);
}
