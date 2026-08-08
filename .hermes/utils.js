'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const appRoot = path.resolve(__dirname);
const configPath = path.join(appRoot, 'config.json');

// ── Security helpers ──────────────────────────────────────────────────────────

/** Strip newlines/control chars to prevent log injection (CWE-117) */
function sanitizeLog(input) {
  if (typeof input !== 'string') return String(input);
  return input.replace(/[\r\n\t\x00-\x1f\x7f]/g, ' ').slice(0, 512);
}

/**
 * Resolve a user-supplied path safely inside a trusted root (CWE-22/23).
 * Throws if the resolved path escapes the root.
 */
function safePath(root, ...parts) {
  const resolved = path.resolve(root, ...parts);
  if (!resolved.startsWith(path.resolve(root) + path.sep) && resolved !== path.resolve(root)) {
    throw new Error(`Path traversal detected: ${parts.join('/')}`);
  }
  return resolved;
}

/**
 * Validate a URL against an allowlist of trusted hosts (CWE-918 SSRF).
 * Returns the URL string if valid, throws otherwise.
 */
const ALLOWED_HOSTS = (process.env.HERMES_ALLOWED_HOSTS || 'localhost,127.0.0.1').split(',').map(h => h.trim());
function validateUrl(rawUrl) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error(`Invalid URL: ${rawUrl}`); }
  const host = parsed.hostname;
  if (!ALLOWED_HOSTS.some(h => host === h || host.endsWith(`.${h}`))) {
    throw new Error(`SSRF blocked: host "${host}" not in allowlist`);
  }
  return rawUrl;
}

// ── JSON helpers ──────────────────────────────────────────────────────────────

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try { return JSON.parse(fs.readFileSync(filePath, 'utf-8')); }
  catch { return null; }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

// ── Config ────────────────────────────────────────────────────────────────────

function loadConfig() {
  const defaults = {
    hermesHome: process.env.HERMES_HOME || path.join(os.homedir(), '.hermes'),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    databaseUrl: process.env.DATABASE_URL || '',
    logLevel: process.env.HERMES_LOG_LEVEL || 'info',
    modelProvider: process.env.HERMES_MODEL_PROVIDER || 'openai',
    mcpEnabled: process.env.HERMES_MCP_ENABLED === 'true',
    telemetryEnabled: process.env.HERMES_TELEMETRY !== 'false',
  };
  const fileConfig = readJson(configPath) || {};
  return { ...defaults, ...fileConfig };
}

function saveConfig(partialConfig) {
  const merged = { ...loadConfig(), ...partialConfig };
  writeJson(configPath, merged);
  return merged;
}

function ensureHermesHome(home) {
  const fullPath = home.startsWith('~')
    ? path.join(os.homedir(), home.slice(1))
    : home;
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

module.exports = {
  appRoot,
  configPath,
  loadConfig,
  saveConfig,
  ensureHermesHome,
  readJson,
  writeJson,
  sanitizeLog,
  safePath,
  validateUrl,
};
