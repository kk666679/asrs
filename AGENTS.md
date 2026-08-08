<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# ASRS Agent Rules & Current State

This document is the **authoritative project-rules file** for AI agents working in this repository. It is consumed by the Hermes agent framework (`@asrs/hermes`), Claude Code, and other coding agents. Read the relevant section before modifying any code.

## 1. Repository Overview (Monorepo)

This is a **warehouse automation platform** split across three packages:

| Area | Path | Stack | Purpose |
|------|------|-------|---------|
| **Frontend** | `/` (app/) | Next.js 16, React 19, Tailwind 4, Zustand, TanStack Query | Web dashboard for AMR fleet, inventory, analytics, IoT |
| **Backend** | `/backend` | NestJS 11, Prisma 7, SQLite | REST API + WebSocket server |
| **Agent Orchestration** | `/.hermes` | Node 20+, TypeScript, BullMQ + Redis, PostgreSQL | Multi-agent AI orchestration CLI |

> **Note:** The Next.js frontend is a **monorepo root** — the `next` package lives in `node_modules/` at the repo root, not inside `app/`.

## 2. The Hermes Agent Package (`.hermes/`)

Hermes is a **multi-agent AI orchestration CLI** for ASRS. It automates warehouse workflows by delegating jobs to specialised sub-agents via **BullMQ + Redis** queues, with **PostgreSQL** persistence.

### 2.1 Package Layout

```
.hermes/
├── index.js               # CLI entry point (CommonJS, self-contained, no build step)
├── utils.js               # Config/JSON/security helpers (sanitizeLog, safePath, validateUrl)
├── package.json           # @asrs/hermes v2.0.0
├── config.json            # Runtime config (hermesHome, redisUrl, databaseUrl, logLevel)
├── tsconfig.json
├── .env.example           # Documented environment variables
├── docker-compose.yml     # Redis + PostgreSQL (with pgvector)
├── scripts/               # setup.sh, update.sh, backup.sh
├── docs/architecture.md
├── config/
│   ├── default.json       # Infra defaults (redis, postgres)
│   └── models.json        # Model provider registry (openai/anthropic/local)
└── src/
    ├── index.ts           # Boots all 5 agent workers + orchestrator dispatch
    ├── orchestrator.ts    # Skill-based job routing via BullMQ flows
    ├── config/index.ts    # Redis, pg Pool, pino logger, SSRF validation
    ├── queues/
    │   ├── queueFactory.ts# 6 BullMQ queue definitions
    │   └── baseWorker.ts  # Abstract worker with DLQ, task tracking, results emission
    ├── agents/            # 5 implemented agents (BaseAgentWorker subclasses)
    ├── skills/            # 4 YAML skill pipeline definitions
    ├── tools/             # hardware_api.ts, vision.ts
    ├── gateways/          # telegram/discord/slack/whatsapp/email (STUBS)
    ├── interfaces/        # cli/api/web/tui (STUBS)
    ├── memory/            # conventions, profiles, reminders
    ├── context/           # project-rules (safety-policies), channel-context
    ├── models/            # provider configs (openai/anthropic/local/openrouter)
    ├── automation/        # cron (stocktake), webhooks (order_webhook)
    ├── security/          # zero-trust stub (isAuthorized)
    └── utils/             # db.ts, logger.ts (re-exports from config)
```

### 2.2 Current Implementation State

| Component | Status | Location |
|-----------|--------|----------|
| **CLI** (`index.js`) | ✅ Functional | `.hermes/index.js` |
| **5 sub-agents** | ✅ Implemented | `src/agents/*/index.ts` |
| **Orchestrator** | ✅ Implemented | `src/orchestrator.ts` |
| **BullMQ queues** | ✅ Implemented | `src/queues/queueFactory.ts` |
| **Base worker + DLQ** | ✅ Implemented | `src/queues/baseWorker.ts` |
| **AGV / Vision tools** | ✅ Implemented | `src/tools/*.ts` |
| **YAML skills** | ✅ Implemented | `src/skills/*.yaml` |
| **Security hardening** | ✅ Implemented | `utils.js`, `src/config`, `src/tools` |
| **Gateways** | ⚠️ Stubs (log-only) | `src/gateways/*/index.ts` |
| **Interfaces (web/api/tui)** | ⚠️ Stubs | `src/interfaces/*/index.ts` |
| **Model inference** | 🔌 Config-only | `src/models/*/config.json` |
| **Automation** | 🧩 Scaffolded | `src/automation/` |

### 2.3 Agents

All agents extend `BaseAgentWorker` (in `src/queues/baseWorker.ts`) and implement a `process(job)` method. `BaseAgentWorker` handles: BullMQ worker lifecycle, task-status DB tracking, progress updates, results-queue emission, and dead-letter routing on final failure.

| Agent | Queue | Responsibilities |
|-------|-------|------------------|
| `PathPlannerAgent` | `path-planning` | Query `inventory_items.location_coords`, compute a straight-line path to target zone, estimate duration (~150ms/step) |
| `DeviceControllerAgent` | `device-control` | Execute each path point via `sendAGVCommand`; stops on first failure; returns final position |
| `InventoryManagerAgent` | `inventory-mgmt` | Update quantity/location, write audit trail, return updated row |
| `ExceptionHandlerAgent` | `exception-handling` | Classify errors (`retry`/`reroute`/`manual_intervention`), log to `exception_log` |
| `QualityInspectorAgent` | `quality-inspection` | Run `inspectItem`, quarantine if confidence < 0.7, persist inspection record |

### 2.4 Queues (BullMQ)

Defined in `src/queues/queueFactory.ts`:

- `path-planning`, `inventory-mgmt`, `device-control`, `exception-handling`, `quality-inspection`, `results`
- Plus `dead-letter` (in `baseWorker.ts`) for jobs that exhaust retries.

### 2.5 Orchestrator & Skills

`Orchestrator.dispatch(command, opts)` parses `SKU-XXXX` / `Zone-YYY`, persists a `tasks` row, then routes by `opts.skill`:

- **`store_in`** (default) & **`take_out`**: `path-planning` → `device-control` → `inventory-mgmt` (via BullMQ parent/child flows)
- **`inventory_check`**: `inventory-mgmt.check` only

Skills (YAML) in `src/skills/`: `take_out`, `store_in`, `inventory_check`, `emergency_stop`.

### 2.6 Tools

- **`src/tools/hardware_api.ts`** — `sendAGVCommand()`: sanitizes AGV id, enforces a **command allowlist** (`move|stop|home|charge|pickup|dropoff|status`), calls real AGV API if `AGV_API_URL` is set, else **simulation mode**.
- **`src/tools/vision.ts`** — `inspectItem()`: validates image URL against an allowlist (SSRF protection), calls `VISION_API_URL` if set, else deterministic simulation.

### 2.7 Security Patterns (MUST follow)

Hermes takes security seriously. Reuse these helpers rather than writing new ones:

- **SSRF (CWE-918):** `validateInternalUrl()` / `validateUrl()` — block hosts not in `HERMES_ALLOWED_HOSTS`.
- **Path traversal (CWE-22/23):** `safePath(root, ...parts)` — throws if resolution escapes the trusted root.
- **Log injection (CWE-117):** `sanitizeLog()` / `sanitize()` — strips `\r\n\t` and control chars, truncates.
- **Command injection:** AGV command **allowlist** in `hardware_api.ts`.
- **Secrets redaction:** pino logger redacts `authorization`, `password`, `token`, `secret`.

### 2.8 CLI Commands (`node .hermes/index.js` or `npm run hermes`)

| Command | Description |
|---------|-------------|
| `hermes chat -q "..."` | Create a chat session record |
| `hermes -z "..."` | Script mode session record |
| `hermes -c` / `-r "title"` | Resume most recent / by title |
| `hermes skills` / `skills run <name>` | List / execute a skill pipeline |
| `hermes agents` | List registered agents + impl status |
| `hermes dispatch "Move SKU-1234 to Zone-B"` | Dispatch through orchestrator |
| `hermes mcp list/register/call` | MCP tool registry (local) |
| `hermes status` / `doctor` / `config` / `logs` / `backup` / `update` / `setup` | System ops |

> **Note:** The CLI writes **session records** (JSON in `HERMES_HOME/sessions`) and supports MCP tool registration. Full AI execution requires a connected model provider (`HERMES_MODEL_PROVIDER`) and BullMQ workers.

### 2.9 Environment Variables

See `.hermes/.env.example`. Key ones: `REDIS_URL`, `DATABASE_URL`, `HERMES_HOME`, `HERMES_MODEL_PROVIDER`, `HERMES_ALLOWED_HOSTS`, `AGV_API_URL`, `AGV_API_KEY`, `VISION_API_URL`, `VISION_ALLOWED_HOSTS`, gateway tokens (`SLACK_BOT_TOKEN`, `DISCORD_BOT_TOKEN`, `TELEGRAM_BOT_TOKEN`, `WHATSAPP_API_TOKEN`, `SMTP_HOST`).

### 2.10 Development Workflow (Hermes)

```bash
cd .hermes
npm install
cp .env.example .env.local   # set REDIS_URL, DATABASE_URL, model keys
docker-compose up -d         # Redis + PostgreSQL (+ pgvector)
npm run dev                  # ts-node: boots agents + dispatcher
npm run build                # tsc → dist/
npm run lint && npm test     # ESLint + Jest
```

Top-level wrapper scripts (from repo root):
```bash
npm run hermes -- --help
npm run hermes:update
```

## 3. Conventions & Standards

- **TypeScript strict mode** for `.hermes/src/**` (`strict: true` in `tsconfig.json`).
- **CommonJS** for the standalone CLI (`index.js`, `utils.js`).
- **Pino structured logging** — always include `{ jobId, traceId, queue }` context; never log raw secrets.
- **Security-first** — new tools/endpoints must validate URLs, sanitize input, and enforce allowlists.
- **Skills are YAML** — add reusable workflows under `src/skills/`, not in orchestrator code.
- **Agents extend `BaseAgentWorker`** — do not hand-roll BullMQ workers.
- **Conventional Commits** for all changes.
- **Sessions & skills are persisted** as JSON/YAML — keep them human-readable.
