import { logger } from '../config';

const AGV_BASE_URL = process.env.AGV_API_URL || 'http://localhost:8080';
const AGV_API_KEY = process.env.AGV_API_KEY || '';

/** Allowed AGV commands — prevents arbitrary command injection */
const ALLOWED_COMMANDS = new Set(['move', 'stop', 'home', 'charge', 'pickup', 'dropoff', 'status']);

export interface AGVCommandResult {
  success: boolean;
  agvId: string;
  command: string;
  timestamp: string;
  response?: unknown;
}

export async function sendAGVCommand(
  agvId: string,
  command: string,
  payload: unknown
): Promise<AGVCommandResult> {
  // Sanitize inputs
  const safeAgvId = String(agvId).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 32);
  const safeCommand = String(command).toLowerCase();

  if (!ALLOWED_COMMANDS.has(safeCommand)) {
    logger.warn({ agvId: safeAgvId, command: safeCommand }, 'AGV command rejected — not in allowlist');
    return { success: false, agvId: safeAgvId, command: safeCommand, timestamp: new Date().toISOString() };
  }

  logger.info({ agvId: safeAgvId, command: safeCommand }, 'Sending AGV command');

  // In production: POST to real AGV controller API
  if (process.env.AGV_API_URL) {
    try {
      const res = await fetch(`${AGV_BASE_URL}/agv/${safeAgvId}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AGV_API_KEY && { 'X-API-Key': AGV_API_KEY }),
        },
        body: JSON.stringify({ command: safeCommand, payload }),
        signal: AbortSignal.timeout(5000),
      });
      const response = res.ok ? await res.json() : { status: res.status };
      return { success: res.ok, agvId: safeAgvId, command: safeCommand, timestamp: new Date().toISOString(), response };
    } catch (err: any) {
      logger.error({ agvId: safeAgvId, err: err.message }, 'AGV command failed');
      return { success: false, agvId: safeAgvId, command: safeCommand, timestamp: new Date().toISOString() };
    }
  }

  // Simulation mode
  logger.debug({ agvId: safeAgvId, command: safeCommand, payload }, 'AGV command simulated');
  return { success: true, agvId: safeAgvId, command: safeCommand, timestamp: new Date().toISOString() };
}
