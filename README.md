# void-playground

Application code lives in `src/`, configured with `sourceDir` in `void.config.ts`:

```text
src/
  db/
    schema.ts
    migrations/
  routes/
    api/posts.ts
  demo.ts
```

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run dev
```

Lint and format with Vite+ (Oxlint and Oxfmt):

```bash
bun run lint       # Lint
bun run lint:fix   # Apply automatic lint fixes
bun run fmt        # Format files
bun run fmt:check  # Check formatting without writing files
bun run typecheck # Generate Void types and type-check with TypeScript
bun run check     # Check formatting, lint, and types together
bun run check:fix # Format and apply automatic lint fixes
```

Type checking runs separately because Oxlint's type checker does not resolve
Void's generated types in this project. The combined `check` commands run both.

Build for deployment:

```bash
bun run build
```
