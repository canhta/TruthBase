# Contributing to TruthBase

Select a scoped GitHub issue before implementation. For new work, describe the problem and expected outcome in an issue first.

### Work on a change

1. Fork/clone the repository and create a focused branch.
2. Read [AGENTS.md](AGENTS.md) and the rules below, then only the contracts named by your issue.
3. Keep one authoritative definition of each behavior. Update references when replacing a document or implementation.
4. Run `node scripts/check_docs.ts` with Node.js 24 LTS and `git diff --check`. The documentation checker has no third-party dependencies. Add application tests only for meaningful behavior once application code exists.
5. Open a PR explaining the problem, observable change and commands actually run. Link the issue/task and disclose untested paths.

Use synthetic fixtures. Keep credentials, customer data, local reports and upstream checkouts out of commits. Do not report a mocked adapter as a working integration. Follow the repository's risk-based test and minimal-comment rules rather than adding coverage for its own sake.

Contributions are accepted under the repository license. Respect other contributors: discuss the work, give actionable feedback, and avoid harassment or disclosure of private information. Maintainers may moderate issues and PRs that violate these expectations.

## Implementation rules

Read with the selected issue. Product contracts remain authoritative; this file governs how implementation work is done.

### Agent execution

Select one unblocked `ready-for-agent` GitHub issue and verify its prerequisite evidence. Read the issue's named sections, then follow pointers only for behavior touched. Write a short plan with the observable outcome, risk and verification command before editing. Resolve conflicting contracts at their owner document before coding. Record unverified assumptions as blocked or not tested. Finish with the review and handoff below; update progress from executed evidence.

Use existing tools and conventions. Propose a dependency only when an existing facility cannot satisfy a stated requirement; record purpose, pin, license and actual contract evidence. Source ingestion never authorizes running imported code. No package installation or external data transfer is implied by a task's reading list.

### Code

- Use strict TypeScript on Node.js for backend/domain code and React/TypeScript with Astryx for the web console, typed boundary models and one modular application initially. Domain rules depend on interfaces, not framework requests, SQL sessions or vendor SDK types. Keep gateway, worker and adapter capabilities separate without creating services merely to match diagram boxes.
- Enable `strict`, `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Validate external data at runtime; do not bypass it with `any`, non-null assertions or unchecked casts. Use discriminated unions for state/results. Keep money and counters exact within the canonical wire contract; no floating-point budget accounting.
- Give each decision, eligibility predicate and digest codec one implementation owner. Keep transaction boundaries visible. Validate untrusted data once at ingress and enforce database constraints for scope, identity and concurrency.
- Introduce an abstraction when it hides a concrete policy or integration boundary, or removes demonstrated duplication. Avoid speculative registries, generic workflow engines, one-line forwarding layers and configuration for hypothetical needs.
- Handle expected failures with the canonical error codes. Preserve causal exceptions in restricted diagnostics; never catch an authorization failure and continue. Log IDs and outcomes rather than private payloads.
- Use names for business meaning and ordinary control flow. Comments explain a non-obvious constraint or tradeoff that code cannot express. Omit narration, section banners, commented-out code and docstrings that repeat signatures. Remove dead code and obsolete paths when replacing behavior.

### Dependency reuse baseline

Prefer maintained libraries for commodity mechanisms; custom code owns trust, provenance, revision selection, approval, scope and revocation. The table is the default selection guide, not an installed or compatibility-tested stack. Add each dependency only in its owning issue, pin a released version and lockfile, inspect license/advisories/maintenance and run the relevant contract gate. Do not install the whole table during scaffolding or assume popularity proves correctness.

| Boundary / owner | Preferred reuse | What stays in TruthBase / admission evidence |
|---|---|---|
| HTTP/schema — M00/M03 | [Fastify](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) + [JSON Schema type provider](https://fastify.dev/docs/latest/Reference/Type-Providers/) with inferred TypeScript types | Application-owned schemas with coercion/default mutation disabled and unknown fields rejected; generated OpenAPI; business guards and `gm-json-v1` remain explicit and independently tested |
| Control ledger — M03 | [node-postgres](https://node-postgres.com/features/transactions) + [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) | Transactions, migrations and driver reuse; prove row locks, RLS/pool reset and outbox atomicity; all transaction statements use the same checked-out client |
| Frontmatter — M03 | [yaml](https://eemeli.org/yaml/) + typed validation | Enforce the stricter JSON-compatible subset, duplicate/alias/depth limits and exact body handling; parser defaults alone do not satisfy the file contract |
| Connector HTTP — M13/M18 | Node.js built-in fetch | Typed provider mappings, scoped endpoint allowlists and bounded timeout/retry; use a vendor SDK only if its pinned API covers the required endpoint |
| MCP — M14 | [Official TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Reuse protocol/transport; test authentication/delegation and real clients; no handwritten MCP framing |
| Web data — M12 | [TanStack Query](https://tanstack.com/query/latest/docs/framework/react) + [openapi-typescript/openapi-fetch](https://openapi-ts.dev/introduction) | Generate client types from one backend schema; scope cache keys and clear revoked/previous-user data; no parallel handwritten DTOs |
| Markdown preview — M12 | [react-markdown](https://github.com/remarkjs/react-markdown), remark-gfm and [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize) | Strict web URL/asset policy and scoped internal links; no desktop `file:` protocol or unsanitized HTML path |
| Markdown editor — M12 | Monaco source editor as inspected in Orca; [Tiptap](https://tiptap.dev/docs/editor/markdown) for gated rich editing | Reuse editor mechanics; source/preview is the lossless baseline. Rich mode needs fact/frontmatter/table/exception round-trip proof; unsupported syntax stays source-only. Markdown extension is beta at inspection, not assumed production-safe |
| Graph — M12 | [React Flow](https://reactflow.dev/learn/advanced-use/accessibility) | Bounded authorized nodes/edges, list alternative and measured fixture size; no custom canvas engine or new graph database |
| Durable jobs — M16 | Evaluate [pg-boss](https://github.com/timgit/pg-boss) first | It uses existing PostgreSQL for tasks/locks/retries/periodic work. Require crash, transactional admission, fencing and schedule/timezone proof; TruthBase keeps business idempotency/authority. Do not add Redis/Temporal or build a queue before documenting a concrete unmet requirement |
| Multi-provider inference — M19 | Evaluate [AI SDK](https://ai-sdk.dev/providers/ai-sdk-providers) behind the LLM port | Prefer it for the four required provider mappings; pin/test each selected provider and disable unapproved routes/logging/fallbacks. No proxy service or agent framework is required merely to call a model |
| Verification — owning issue | [Vitest](https://vitest.dev/guide/), [Playwright](https://playwright.dev/docs/intro) | Assign each risk to the narrowest effective layer; use real PostgreSQL/filesystem for state boundaries and a small browser workflow set, not three copies of every test |

Astryx remains the chosen component/theme layer. Git backup uses the installed Git CLI through explicit argument arrays and restricted configuration; do not recreate Git or add a wrapper solely to execute commands. pg-boss and AI SDK are candidates requiring their owning spikes, not compatibility claims or substitutes for business policy. Security-sensitive OAuth/crypto must use maintained standards implementations selected with the identity/key deployment decision, never custom protocols.

### Mindful tests

Choose tests by failure risk and observable contract, not method count or coverage percentage. Before adding a test, name the regression it catches and why a cheaper existing check does not catch it.

| Risk | Evidence to prefer |
|---|---|
| Pure rule, digest, time boundary | Small deterministic table of meaningful boundary cases |
| Transaction, uniqueness, race, retry | Real PostgreSQL integration test with controlled concurrency/failure injection and state/outbox assertions |
| Markdown persistence | Real temporary filesystem plus database; crash/retry boundaries, hash mismatch and scoped path rejection |
| Access, publication, revocation | Real policy boundary plus captured model input/output; assert denied bytes and side effects are absent |
| Vendor behavior | Contract test against exact pinned dependency; mocks prove only local mapping/error handling |
| User workflow | One end-to-end refund fixture crossing the relevant boundaries |
| Extraction/answer semantics | Versioned adjudicated cases preserving conditions, evidence and time; separate quality scores from safety gates |

Test public behavior and durable outcomes. Avoid tests for private helper structure, framework behavior, static getters, duplicated constants, snapshots of incidental formatting, or mocks that merely restate implementation. Fixing a behavioral defect earns a regression test at the narrowest effective boundary. Documentation-only edits use documentation checks, not invented runtime tests.

Each scenario has one owning task; later tasks reuse it and add only new boundary assertions. Run the smallest relevant checks and the task's required safety/adapter tests. Broaden only for changed boundaries or unresolved failures. Report exact commands, environment, observed result and limitations; distinguish unit, mocked, real integration and semantic evidence. A finite suite is evidence, not a claim of perfect security.

### Review and handoff

Review the diff against the issue and canonical contracts. Check changed authorization/state/retry boundaries, unnecessary abstractions or comments, and whether the evidence proves the claimed layer. Record defects with severity, location, failure, requirement and correction. An implementation review does not approve runtime business facts.

Write a local handoff in ignored `reports/` containing task/issue ID, date, commit, changed files, verified outcome, exact commands and results, environment/pins, requirement/scenario coverage, external actions, unresolved risks, owner decisions and next eligible task. Include failed attempts. Update the issue with authorized progress; GitHub Issues are the sole progress record; keep no local status mirror. Never count expected future work as complete.
