import { logger } from './config';
import { PathPlannerAgent } from './agents/path-planner';
import { InventoryManagerAgent } from './agents/inventory-manager';
import { DeviceControllerAgent } from './agents/device-controller';
import { ExceptionHandlerAgent } from './agents/exception-handler';
import { QualityInspectorAgent } from './agents/quality-inspector';
import { Orchestrator } from './orchestrator';
import { pgPool } from './config';

async function main() {
  const workers = [
    new PathPlannerAgent(),
    new InventoryManagerAgent(),
    new DeviceControllerAgent(),
    new ExceptionHandlerAgent(),
    new QualityInspectorAgent(),
  ];

  logger.info('🚀 All Hermes ASRS agents are online.');

  const args = process.argv.slice(2);
  if (args.length > 0) {
    const orchestrator = new Orchestrator();
    const command = args.join(' ');
    try {
      const result = await orchestrator.dispatch(command);
      logger.info({ result }, 'Task queued');
    } catch (err) {
      logger.error({ err }, 'Dispatch failed');
    }
  } else {
    logger.info('Hermes is idle. Send a command like: "Move SKU-1234 to Zone-B"');
  }

  async function shutdown(signal: string) {
    logger.info({ signal }, 'Shutting down gracefully...');
    await Promise.all(workers.map(w => w.gracefulShutdown()));
    await pgPool.end();
    logger.info('Shutdown complete.');
    process.exit(0);
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
