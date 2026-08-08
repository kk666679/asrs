#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');
const {
  loadConfig, saveConfig, ensureHermesHome,
  readJson, writeJson, sanitizeLog, safePath, configPath,
} = require('./utils');

const appRoot = path.resolve(__dirname);
const pkg = require(path.join(appRoot, 'package.json'));
const config = loadConfig();
const hermesHome = ensureHermesHome(config.hermesHome);
const sessionsDir = path.join(hermesHome, 'sessions');
const logsDir = path.join(hermesHome, 'logs');
const mcpRegistryPath = path.join(hermesHome, 'mcp-registry.json');
const statePath = path.join(appRoot, 'state.json');

// ── Logging ───────────────────────────────────────────────────────────────────

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LOG_LEVELS[config.logLevel] ?? 1;

function log(msg, level = 'info') {
  if ((LOG_LEVELS[level] ?? 1) < currentLevel) return;
  const safe = sanitizeLog(msg);
  const prefix = level === 'error' ? '\x1b[31m[Hermes]\x1b[0m'
               : level === 'warn'  ? '\x1b[33m[Hermes]\x1b[0m'
               : '\x1b[36m[Hermes]\x1b[0m';
  console.log(`${prefix} ${safe}`);
  if (config.telemetryEnabled) appendLog(`[${level.toUpperCase()}] ${safe}`);
}

function appendLog(line) {
  try {
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
    const logFile = path.join(logsDir, `hermes-${new Date().toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(logFile, `${new Date().toISOString()} ${line}\n`, 'utf-8');
  } catch {}
}

// ── Sessions ──────────────────────────────────────────────────────────────────

function ensureSessionsDir() {
  if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
}

function createSession(data) {
  ensureSessionsDir();
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const session = {
    id,
    title: data.title || `Hermes session ${new Date().toISOString()}`,
    type: data.type || 'unknown',
    query: data.query || null,
    skill: data.skill || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'created',
    turns: [],
    metadata: data.metadata || {},
  };
  writeJson(safePath(sessionsDir, `${id}.json`), session);
  return session;
}

function updateSession(id, patch) {
  const file = safePath(sessionsDir, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const session = { ...readJson(file), ...patch, updatedAt: new Date().toISOString() };
  writeJson(file, session);
  return session;
}

function listSessions() {
  ensureSessionsDir();
  return fs.readdirSync(sessionsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJson(safePath(sessionsDir, f)))
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getLatestSession() {
  const sessions = listSessions();
  return sessions[0] || null;
}

// ── MCP Tool Registry ─────────────────────────────────────────────────────────

function loadMcpRegistry() {
  return readJson(mcpRegistryPath) || { tools: [], servers: [] };
}

function saveMcpRegistry(registry) {
  writeJson(mcpRegistryPath, registry);
}

function registerMcpTool(tool) {
  const registry = loadMcpRegistry();
  const existing = registry.tools.findIndex(t => t.name === tool.name);
  if (existing >= 0) registry.tools[existing] = { ...registry.tools[existing], ...tool };
  else registry.tools.push({ ...tool, registeredAt: new Date().toISOString() });
  saveMcpRegistry(registry);
  return registry;
}

// ── Skills ────────────────────────────────────────────────────────────────────

const SKILLS_DIR = path.join(appRoot, 'src', 'skills');

function listSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR)
    .filter(f => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map(f => f.replace(/\.ya?ml$/, ''));
}

function readSkill(name) {
  const candidates = [
    path.join(SKILLS_DIR, `${name}.yaml`),
    path.join(SKILLS_DIR, `${name}.yml`),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return fs.readFileSync(c, 'utf-8');
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function runCommand(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  return result.status ?? 1;
}

function printHelp() {
  console.log(`
\x1b[1m\x1b[36mHermes CLI\x1b[0m v${pkg.version} — ASRS Agentic Orchestrator

\x1b[1mUsage:\x1b[0m
  hermes <command> [options]

\x1b[1mCore Commands:\x1b[0m
  chat -q "<query>"          Submit a natural-language task query
  -z "<query>"               Script/pipe mode (same as chat, no prompts)
  -c | --continue            Resume the most recent session
  -r "<title>"               Resume a session by title search

\x1b[1mAgent & Skills:\x1b[0m
  skills                     List available agent skills
  skills run <name> [args]   Execute a skill pipeline
  agents                     Show registered agent status
  dispatch "<command>"       Dispatch a warehouse command (e.g. "Move SKU-1234 to Zone-B")

\x1b[1mMCP (Model Context Protocol):\x1b[0m
  mcp list                   List registered MCP tools
  mcp register <name> <url>  Register a new MCP tool server
  mcp call <tool> [args]     Call an MCP tool directly

\x1b[1mSession Management:\x1b[0m
  sessions                   List all sessions
  sessions show <id>         Show session detail
  sessions clear             Delete all sessions

\x1b[1mSystem:\x1b[0m
  status                     Show system status
  doctor                     Run environment diagnostics
  config view                View current config
  config set <key> <value>   Update a config value
  logs [--tail <n>]          View recent log entries
  backup                     Backup config and state
  update [--check]           Refresh dependencies
  setup                      Initialize Hermes home

\x1b[1mOptions:\x1b[0m
  --help | -h                Show this help
  --version | -v             Show version
  --tui                      Launch terminal UI (requires full runtime)
`);
}

// ── Command Handlers ──────────────────────────────────────────────────────────

function handleChat(argv) {
  const qi = argv.findIndex(a => a === '-q' || a === '--query');
  const query = qi !== -1 ? argv[qi + 1] : null;
  if (!query) { log('No query provided. Use: hermes chat -q "Your question"', 'warn'); return 1; }

  const session = createSession({ type: 'chat', query });
  log(`Session created: ${session.id}`);
  log(`Query: ${sanitizeLog(query)}`);
  log('Query recorded. Connect a model provider via HERMES_MODEL_PROVIDER to enable AI execution.');
  return 0;
}

function handleScriptMode(argv) {
  const qi = argv.indexOf('-z');
  const query = qi !== -1 ? argv[qi + 1] : null;
  if (!query) { log('No query. Use: hermes -z "Your question"', 'warn'); return 1; }
  const session = createSession({ type: 'script', query });
  log(`Script session: ${session.id}`);
  return 0;
}

function handleContinue() {
  const session = getLatestSession();
  if (!session) { log('No session found to continue.', 'warn'); return 1; }
  log(`Resuming: ${session.id} — "${sanitizeLog(session.title)}" (${session.status})`);
  if (session.query) log(`Last query: ${sanitizeLog(session.query)}`);
  return 0;
}

function handleResume(argv) {
  const ri = argv.findIndex(a => a === '-r' || a === '--resume');
  const title = ri !== -1 ? argv[ri + 1] : null;
  if (!title) { log('No title provided. Use: hermes -r "session title"', 'warn'); return 1; }

  const match = listSessions().find(s =>
    s.title?.toLowerCase().includes(title.toLowerCase()) ||
    s.id?.includes(title)
  );
  if (!match) { log(`No session matching: "${sanitizeLog(title)}"`, 'warn'); return 1; }

  log(`Resuming: ${match.id} — "${sanitizeLog(match.title)}"`);
  log(`Status: ${match.status} | Type: ${match.type} | Turns: ${match.turns?.length ?? 0}`);
  if (match.query) log(`Query: ${sanitizeLog(match.query)}`);
  return 0;
}

function handleSessions(argv) {
  const sub = argv[1];

  if (sub === 'show' && argv[2]) {
    const id = argv[2];
    const sessions = listSessions();
    const s = sessions.find(x => x.id === id || x.id.includes(id));
    if (!s) { log(`Session not found: ${sanitizeLog(id)}`, 'warn'); return 1; }
    console.log(JSON.stringify(s, null, 2));
    return 0;
  }

  if (sub === 'clear') {
    ensureSessionsDir();
    const files = fs.readdirSync(sessionsDir).filter(f => f.endsWith('.json'));
    files.forEach(f => fs.unlinkSync(safePath(sessionsDir, f)));
    log(`Cleared ${files.length} session(s).`);
    return 0;
  }

  // Default: list
  const sessions = listSessions();
  if (!sessions.length) { log('No sessions found.'); return 0; }
  log(`${sessions.length} session(s):`);
  sessions.slice(0, 20).forEach(s => {
    const age = Math.round((Date.now() - new Date(s.updatedAt)) / 60000);
    console.log(`  \x1b[33m${s.id}\x1b[0m  ${s.status.padEnd(10)} ${sanitizeLog(s.title).slice(0, 50)}  (${age}m ago)`);
  });
  return 0;
}

function handleSkills(argv) {
  const sub = argv[1];

  if (sub === 'run' && argv[2]) {
    const name = argv[2];
    const content = readSkill(name);
    if (!content) { log(`Skill not found: ${sanitizeLog(name)}`, 'warn'); return 1; }

    const session = createSession({ type: 'skill', skill: name, query: argv.slice(3).join(' ') || null });
    log(`Executing skill: ${sanitizeLog(name)} (session: ${session.id})`);

    // Parse YAML steps minimally (no yaml dep required)
    const steps = content.match(/- agent: (\S+)/g)?.map(l => l.replace('- agent: ', '')) || [];
    if (!steps.length) { log('No agent steps found in skill.', 'warn'); return 1; }

    log(`Pipeline: ${steps.join(' → ')}`);
    steps.forEach((agent, i) => log(`  [${i + 1}/${steps.length}] ${agent} — queued`));
    updateSession(session.id, { status: 'queued', metadata: { skill: name, steps } });
    log('Skill queued. Connect BullMQ workers to execute.');
    return 0;
  }

  // Default: list
  const skills = listSkills();
  if (!skills.length) { log('No skills found in src/skills/'); return 0; }
  log(`Available skills (${skills.length}):`);
  skills.forEach(s => {
    const content = readSkill(s) || '';
    const steps = content.match(/- agent: (\S+)/g)?.map(l => l.replace('- agent: ', '')) || [];
    console.log(`  \x1b[32m${s}\x1b[0m  →  ${steps.join(' → ') || '(no steps)'}`);
  });
  return 0;
}

function handleAgents() {
  const agentsDir = path.join(appRoot, 'src', 'agents');
  if (!fs.existsSync(agentsDir)) { log('No agents directory found.', 'warn'); return 1; }
  const agents = fs.readdirSync(agentsDir).filter(f =>
    fs.statSync(path.join(agentsDir, f)).isDirectory()
  );
  log(`Registered agents (${agents.length}):`);
  agents.forEach(a => {
    const hasImpl = fs.existsSync(path.join(agentsDir, a, 'index.ts'));
    const status = hasImpl ? '\x1b[32m✓ implemented\x1b[0m' : '\x1b[33m⚠ stub\x1b[0m';
    console.log(`  ${a.padEnd(25)} ${status}`);
  });
  return 0;
}

function handleDispatch(argv) {
  const command = argv.slice(1).join(' ');
  if (!command) { log('No command. Use: hermes dispatch "Move SKU-1234 to Zone-B"', 'warn'); return 1; }

  const skuMatch = command.match(/SKU-(\w+)/i);
  const zoneMatch = command.match(/Zone-(\w+)/i);
  if (!skuMatch || !zoneMatch) {
    log('Command format: "Move SKU-XXXX to Zone-YYY"', 'warn');
    return 1;
  }

  const session = createSession({
    type: 'dispatch',
    query: sanitizeLog(command),
    metadata: { sku: skuMatch[0], zone: zoneMatch[0] },
  });
  log(`Dispatch queued: ${sanitizeLog(command)}`);
  log(`Session: ${session.id} | SKU: ${skuMatch[0]} | Zone: ${zoneMatch[0]}`);
  log('Connect BullMQ + Orchestrator to execute.');
  return 0;
}

function handleMcp(argv) {
  const sub = argv[1];
  const registry = loadMcpRegistry();

  if (sub === 'list') {
    if (!registry.tools.length) { log('No MCP tools registered. Use: hermes mcp register <name> <url>'); return 0; }
    log(`MCP tools (${registry.tools.length}):`);
    registry.tools.forEach(t => {
      console.log(`  \x1b[35m${t.name.padEnd(20)}\x1b[0m  ${t.url || '(local)'}  ${t.description || ''}`);
    });
    return 0;
  }

  if (sub === 'register' && argv[2] && argv[3]) {
    const [name, url] = [argv[2], argv[3]];
    registerMcpTool({ name: sanitizeLog(name), url: sanitizeLog(url), description: argv[4] || '' });
    log(`MCP tool registered: ${sanitizeLog(name)} → ${sanitizeLog(url)}`);
    return 0;
  }

  if (sub === 'call' && argv[2]) {
    const toolName = argv[2];
    const tool = registry.tools.find(t => t.name === toolName);
    if (!tool) { log(`MCP tool not found: ${sanitizeLog(toolName)}`, 'warn'); return 1; }
    log(`Calling MCP tool: ${sanitizeLog(toolName)}`);
    log('MCP execution requires a live MCP server. Tool call recorded.');
    createSession({ type: 'mcp-call', query: toolName, metadata: { tool, args: argv.slice(3) } });
    return 0;
  }

  log('Usage: hermes mcp list | mcp register <name> <url> | mcp call <tool>', 'warn');
  return 1;
}

function handleStatus() {
  const sessions = listSessions();
  const skills = listSkills();
  const registry = loadMcpRegistry();
  const agentsDir = path.join(appRoot, 'src', 'agents');
  const agentCount = fs.existsSync(agentsDir)
    ? fs.readdirSync(agentsDir).filter(f => fs.statSync(path.join(agentsDir, f)).isDirectory()).length
    : 0;

  log('Hermes status:');
  console.log(`  package          ${pkg.name}@${pkg.version}`);
  console.log(`  node             ${process.version}`);
  console.log(`  hermes home      ${hermesHome}`);
  console.log(`  config           ${configPath}`);
  console.log(`  model provider   ${config.modelProvider}`);
  console.log(`  mcp enabled      ${config.mcpEnabled}`);
  console.log(`  telemetry        ${config.telemetryEnabled}`);
  console.log(`  sessions         ${sessions.length} (${sessions.filter(s => s.status === 'created').length} active)`);
  console.log(`  skills           ${skills.length}`);
  console.log(`  agents           ${agentCount}`);
  console.log(`  mcp tools        ${registry.tools.length}`);
  return 0;
}

function handleDoctor() {
  log('Running diagnostics...');
  const checks = [
    ['Node.js ≥ 18', () => parseInt(process.version.slice(1)) >= 18],
    ['config.json readable', () => fs.existsSync(configPath)],
    ['sessions dir', () => fs.existsSync(sessionsDir)],
    ['skills dir', () => fs.existsSync(SKILLS_DIR)],
    ['redis-cli', () => runCommand('redis-cli', ['--version'], { stdio: 'ignore' }) === 0],
    ['REDIS_URL set', () => !!process.env.REDIS_URL],
    ['DATABASE_URL set', () => !!process.env.DATABASE_URL],
    ['MODEL_PROVIDER set', () => !!process.env.HERMES_MODEL_PROVIDER],
  ];
  let passed = 0;
  checks.forEach(([label, check]) => {
    let ok = false;
    try { ok = check(); } catch {}
    const icon = ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
    console.log(`  ${icon}  ${label}`);
    if (ok) passed++;
  });
  log(`${passed}/${checks.length} checks passed.`);
  return passed === checks.length ? 0 : 1;
}

function handleConfig(argv) {
  if (argv[1] === 'view') {
    const safe = { ...config };
    if (safe.databaseUrl) safe.databaseUrl = safe.databaseUrl.replace(/:\/\/[^@]+@/, '://<redacted>@');
    console.log(JSON.stringify(safe, null, 2));
    return 0;
  }
  if (argv[1] === 'set' && argv[2] && argv[3]) {
    const updated = saveConfig({ [sanitizeLog(argv[2])]: sanitizeLog(argv[3]) });
    log(`Config updated: ${sanitizeLog(argv[2])} = ${sanitizeLog(argv[3])}`);
    return 0;
  }
  log('Usage: hermes config view | config set <key> <value>', 'warn');
  return 1;
}

function handleLogs(argv) {
  if (!fs.existsSync(logsDir)) { log('No logs yet.'); return 0; }
  const tailN = parseInt(argv[argv.indexOf('--tail') + 1]) || 50;
  const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log')).sort().reverse();
  if (!files.length) { log('No log files found.'); return 0; }
  const latest = path.join(logsDir, files[0]);
  const lines = fs.readFileSync(latest, 'utf-8').trim().split('\n');
  const tail = lines.slice(-tailN);
  log(`Last ${tail.length} lines from ${files[0]}:`);
  tail.forEach(l => console.log(l));
  return 0;
}

function handleBackup() {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(hermesHome, `backup_${ts}`);
  fs.mkdirSync(backupDir, { recursive: true });
  const items = [
    [configPath, 'config.json'],
    [statePath, 'state.json'],
    [mcpRegistryPath, 'mcp-registry.json'],
  ];
  items.forEach(([src, dest]) => {
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(backupDir, dest));
  });
  if (fs.existsSync(sessionsDir)) {
    const sessBackup = path.join(backupDir, 'sessions');
    fs.mkdirSync(sessBackup, { recursive: true });
    fs.readdirSync(sessionsDir).filter(f => f.endsWith('.json'))
      .forEach(f => fs.copyFileSync(safePath(sessionsDir, f), path.join(sessBackup, f)));
  }
  log(`Backup complete → ${backupDir}`);
  return 0;
}

function handleUpdate(argv) {
  const check = argv.includes('--check');
  const backup = argv.includes('--backup');
  const bi = argv.indexOf('--branch');
  const branch = bi !== -1 && argv[bi + 1] ? argv[bi + 1] : 'main';

  if (check) {
    log(`Update check — branch: ${sanitizeLog(branch)}`);
    log(`Dependencies: ${Object.keys(pkg.dependencies || {}).join(', ')}`);
    return 0;
  }
  if (backup) handleBackup();
  log('Refreshing dependencies...');
  const status = runCommand('npm', ['install'], { cwd: appRoot });
  if (status !== 0) { log('npm install failed.', 'error'); return status; }
  log(`Update complete (branch: ${sanitizeLog(branch)}).`);
  return 0;
}

function handleSetup() {
  log('Initializing Hermes home...');
  saveConfig(config);
  ensureHermesHome(hermesHome);
  ensureSessionsDir();
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  if (!fs.existsSync(statePath)) writeJson(statePath, { createdAt: new Date().toISOString(), version: pkg.version });
  if (!fs.existsSync(mcpRegistryPath)) saveMcpRegistry({ tools: [], servers: [] });
  log('Setup complete.');
  log(`Hermes home: ${hermesHome}`);
  return 0;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const argv = process.argv.slice(2);

  if (!argv.length || argv.includes('-h') || argv.includes('--help')) { printHelp(); return 0; }
  if (argv.includes('-v') || argv.includes('--version')) { console.log(pkg.version); return 0; }

  const cmd = argv[0];

  if (cmd === 'chat')           return handleChat(argv);
  if (cmd === '-z')             return handleScriptMode(argv);
  if (cmd === '-c' || cmd === '--continue') return handleContinue();
  if (cmd === '-r' || cmd === '--resume')   return handleResume(argv);
  if (cmd === 'sessions')       return handleSessions(argv);
  if (cmd === 'skills')         return handleSkills(argv);
  if (cmd === 'agents')         return handleAgents();
  if (cmd === 'dispatch')       return handleDispatch(argv);
  if (cmd === 'mcp')            return handleMcp(argv);
  if (cmd === 'status')         return handleStatus();
  if (cmd === 'doctor')         return handleDoctor();
  if (cmd === 'config')         return handleConfig(argv);
  if (cmd === 'logs')           return handleLogs(argv);
  if (cmd === 'backup')         return handleBackup();
  if (cmd === 'update')         return handleUpdate(argv);
  if (cmd === 'setup')          return handleSetup();
  if (cmd === '--tui') {
    log('TUI mode requires the full Hermes runtime. Use `hermes chat -q "..."` instead.');
    return 0;
  }

  log(`Unknown command: "${sanitizeLog(cmd)}". Use --help for usage.`, 'warn');
  return 1;
}

process.exit(main());
