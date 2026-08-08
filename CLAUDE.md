@AGENTS.md

---

# Claude Code Workspace Guide — ASRS

This file supplements `AGENTS.md` with Claude-specific guidance for working with this repository, with a focus on the **Hermes multi-agent package** (`.hermes/`).

## Working with the Hermes Codebase (TypeScript)

The `.hermes/src/**` tree is **strict TypeScript** (`strict: true`, ES2022, CommonJS). Follow these conventions:

### 1. Agents must extend `BaseAgentWorker`

Never create a raw BullMQ `Worker`. Every agent is a subclass of `BaseAgentWorker` (`src/queues/baseWorker.ts`):

```ts
export class MyAgent extends BaseAgentWorker {
  constructor() { super('my-queue'); }
  protected async process(job: Job): Promise<MyResult> {
    // return typed result; BaseAgentWorker handles tracking, DLQ, results queue
  }
}
```

### 2. Use the shared security helpers

Hermes is security-hardened. Reuse existing helpers instead of writing ad-hoc checks:

| Concern | Helper | Location |
|---------|--------|----------|
| SSRF (CWE-918) | `validateInternalUrl()` | `src/config/index.ts` |
| Path traversal (CWE-22/23) | `safePath()` | `utils.js` |
| Log injection (CWE-117) | `sanitizeLog()` / `sanitize()` | `utils.js` / `src/gateways/types.ts` |
| Command allowlist | `ALLOWED_COMMANDS` | `src/tools/hardware_api.ts` |
| Secrets redaction | pino `redact` array | `src/config/index.ts` |

### 3. Structured logging with context

Always log with structured context (never raw secrets):

```ts
logger.info({ jobId: job.id, traceId, queue: this.queueName }, 'Message');
```

### 4. Skills are YAML, not code

Add reusable workflows as YAML under `src/skills/`, following the existing `take_out.yaml` / `store_in.yaml` schema (agents + `depends_on` + `input` / `output`).

### 5. Gateways & Interfaces are stubs

`src/gateways/*` and `src/interfaces/*` currently **log-only stubs**. When implementing a real integration (e.g. Slack WebClient), preserve the `Gateway` interface in `src/gateways/types.ts` and gate on the env token (e.g. `SLACK_BOT_TOKEN`), keeping the simulation fallback.

### 6. Type safety on DB rows

Postgres queries return `unknown` rows. Cast deliberately:

```ts
const row = res.rows[0] as Record<string, unknown>;
const coords = (row.location_coords as Coord) ?? { x: 0, y: 0 };
```

### 7. BullMQ job options

Follow the existing pattern in `orchestrator.ts` — set `attempts`, `backoff`, `removeOnComplete`, `removeOnFail`, and use parent/child flows for dependent jobs.

## Testing & Verification

- **Lint/typecheck:** `cd .hermes && npm run lint` and `npm run build` (tsc).
- **Tests:** `cd .hermes && npm test` (Jest; currently `--passWithNoTests`).
- **Standalone CLI (no build):** `node .hermes/index.js --help`, `node .hermes/index.js status`, `node .hermes/index.js doctor`.
- **Wrappers from repo root:** `npm run hermes -- --help`, `npm run hermes:update`.

## Common Tasks

### Adding a new agent
1. Create `src/agents/<name>/index.ts` extending `BaseAgentWorker`.
2. Add a queue in `src/queues/queueFactory.ts` if needed.
3. Register the instance in `src/index.ts` workers array.
4. Optionally add a YAML skill in `src/skills/`.

### Adding a new tool
1. Create `src/tools/<name>.ts`.
2. Use `validateInternalUrl` / allowlists for any external URL.
3. Provide a **simulation fallback** when env vars are unset (mirror `hardware_api.ts` / `vision.ts`).

### Wiring a gateway
1. Implement the `Gateway` interface (`sendMessage`).
2. Gate real calls on the env token; keep a log-only fallback.
3. Update `src/gateways/types.ts` if the contract changes.

## Monorepo Notes

- **Next.js** lives at the repo root — the `next` package is in root `node_modules/`, not inside `app/`. Read `node_modules/next/dist/docs/` before changing Next.js code (see `AGENTS.md`).
- **Backend** is NestJS under `/backend` (separate `pnpm-workspace.yaml` and `node_modules`).
- Keep changes scoped to the relevant package; do not cross-import between `.hermes`, `backend`, and the Next.js app.
</content>
