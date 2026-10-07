# TruthBase

Governed memory for agents: knowledge lives in Markdown files; a transactional control ledger governs review, access and revocation before a fact enters an answer.

The design covers evidence ingestion, human review, scoped retrieval, exact-version publication and revocation, with Hindsight and Hermes integrations. The planned product includes an Astryx web console for access and connection settings, Docker packaging, and MCP access for Codex/OpenCode. TruthBase owns scheduled memory-improvement proposals and private GitHub content backups independently of its agent clients. [GitHub Issues](https://github.com/canhta/TruthBase/issues) are the sole source for implementation scope, progress and blockers.

## Local development

Use the Node.js version declared in `.node-version` (also available through `.nvmrc`) and pnpm declared in `package.json#packageManager`. Install pnpm separately or use an existing Corepack installation with `corepack pnpm` in place of `pnpm`.

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm build
pnpm typecheck
pnpm test
pnpm check:docs
git diff --check
```

Run `pnpm hooks:install` once per clone to install the Lefthook pre-commit hook. It runs Biome checks and TypeScript checks without rewriting files. Dependency postinstall scripts are disabled explicitly; hook installation is an explicit developer command. Biome owns TypeScript, JSON and CSS formatting/linting; Markdown and YAML remain under the documentation checks and diff review.

`pnpm build` compiles core before its API/worker dependents and creates the production web bundle. Run it before type checking or testing from a fresh checkout so workspace declarations exist. `pnpm test` builds core automatically.

| Member          | Purpose                                                             | Run after building                                |
| --------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `apps/api`      | Local HTTP entry point; synthetic `/health` only                    | `pnpm start:api` (`http://127.0.0.1:3000/health`) |
| `apps/web`      | React/Astryx scaffold                                               | `pnpm dev:web` (local Vite URL)                   |
| `apps/worker`   | Bootstrap probe; prints readiness and exits with jobs disabled      | `pnpm start:worker`                               |
| `packages/core` | Server-only runtime bootstrap exported as `@truthbase/core/runtime` | Imported by API and worker                        |

The web member imports no backend package. Core's runtime export resolves only under Node; future browser contracts must have separate browser-safe exports. No integrations, authentication, business endpoints or content storage are enabled by this scaffold. Runtime Markdown content must live outside this source checkout when persistence is introduced.

## Documentation

| Read for                                          | File                                 |
| ------------------------------------------------- | ------------------------------------ |
| Agent instructions                                | [AGENTS.md](AGENTS.md)               |
| Domain vocabulary                                 | [CONTEXT.md](CONTEXT.md)             |
| Contribution, code, tests and handoff             | [CONTRIBUTING.md](CONTRIBUTING.md)   |
| Product, architecture and requirements            | [Specification](docs/spec.md)        |
| Fact model, evidence and human review             | [Facts](docs/facts.md)               |
| Authorization, publication and retrieval          | [Access](docs/access.md)             |
| Transactions, concurrency and revocation ordering | [Consistency](docs/consistency.md)   |
| API shapes and examples                           | [API](docs/api.md)                   |
| Learning, cleanup and operations                  | [Lifecycle](docs/lifecycle.md)       |
| Hindsight, Hermes and upstream source records     | [Integrations](docs/integrations.md) |
| Evaluation criteria and scenarios                 | [Evaluation](docs/evaluation.md)     |
| Design choices and owner decisions                | [ADRs](docs/adr/decisions.md)        |

Read only the sections linked by your issue. Contracts and evaluation cases specify expected behavior; they do not record implementation status or passing results.

## Documentation check

Node.js 24 LTS; no third-party packages required:

```sh
git clone https://github.com/canhta/TruthBase.git
cd TruthBase
node scripts/check_docs.ts
```

The check validates links, examples, traceability and digest vectors. Application and integration evidence belongs in the relevant issue. Local upstream checkouts (`.upstream/`) and reports (`reports/`) are ignored and are not required to validate this repository.

## License and security

[MIT](LICENSE). Upstream projects retain their own licenses and are not vendored here. Report vulnerabilities through [SECURITY.md](SECURITY.md).
