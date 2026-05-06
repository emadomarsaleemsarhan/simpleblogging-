# Render Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare Blog Publisher to run correctly as a Render web service with persistent SQLite storage and exported ZIP files.

**Architecture:** Keep the app as one Next.js web service. Use Render Disk for SQLite and generated storage, run Prisma migrations before starting the server, and define Render environment variables in a committed Blueprint.

**Tech Stack:** Next.js 15, Prisma 7 with SQLite/better-sqlite3 adapter, Render Blueprint, Node.js production runtime.

---

### Task 1: Persistent Storage Paths

**Files:**
- Modify: `src/lib/paths.ts`
- Test: `tests/unit/paths.test.ts`

- [ ] Add a unit test that sets `BLOG_PUBLISHER_STORAGE_ROOT` and expects export paths to live under that root.
- [ ] Update `src/lib/paths.ts` so `BLOG_PUBLISHER_STORAGE_ROOT` overrides `process.cwd()/storage`.
- [ ] Run `npm run test -- tests/unit/paths.test.ts`.

### Task 2: Render Startup Script

**Files:**
- Create: `scripts/render-start.mjs`
- Modify: `package.json`

- [ ] Add a Node startup script that runs `npx prisma migrate deploy` and then starts Next with `npx next start -p ${PORT}`.
- [ ] Add package scripts `render:start` and `prisma:migrate:deploy`.
- [ ] Run the script with `PORT=52346` and confirm `/login` returns HTTP 200.

### Task 3: Render Blueprint And Environment

**Files:**
- Create: `render.yaml`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] Add a Render web service Blueprint with `runtime: node`, `plan: free`, build command, start command, env vars, and a disk mounted at `/var/data`.
- [ ] Document required Render values: `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
- [ ] Update `.env.example` with `BLOG_PUBLISHER_STORAGE_ROOT`.

### Task 4: Verification

**Files:**
- No source edits.

- [ ] Run `npm run test`.
- [ ] Run `npm run build`.
- [ ] Run `CI=1 npm run test:e2e -- tests/e2e/localization.spec.ts tests/e2e/publishing-flow.spec.ts`.
- [ ] Commit all Render deployment changes.
