/** Shared gateway types and sanitization for all notification channels */

export interface GatewayMessage {
  channel: string;
  text: string;
  level?: 'info' | 'warn' | 'error';
  metadata?: Record<string, unknown>;
}

/** Strip newlines and control chars to prevent log injection (CWE-117) */
export function sanitize(input: string): string {
  return input.replace(/[\r\n\t\x00-\x1f\x7f]/g, ' ').slice(0, 2048);
}

export interface Gateway {
  sendMessage(channel: string, text: string, metadata?: Record<string, unknown>): Promise<void>;
}
