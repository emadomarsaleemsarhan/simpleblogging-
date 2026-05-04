# Blog Publisher

Blog Publisher converts Word `.docx` files into reviewable posts, manages a simple publishing workflow, generates a static blog, and exports the generated site as a ZIP.

## Local Development

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run prisma:migrate -- --name init`.
4. Run `npm run prisma:seed`.
5. Run `npm run dev`.
6. Sign in with `admin@example.com` / `admin12345`.

## Useful Commands

```bash
npm run build
npm test
npm run test:e2e
npm run lint
```

## MVP Scope

The MVP supports Word import, post editing, workflow statuses, taxonomy, static site generation, and ZIP export.

GitHub publishing is reserved for a future phase.
