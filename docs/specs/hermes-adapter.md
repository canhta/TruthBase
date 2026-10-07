# Hermes Adapter and Runtime Boundaries

Status: proposed integration. Official upstream references: [S01-S04](upstream-evidence.md). Pin exact source before implementation.

## Integration strategy

Implement one custom memory provider named `company_memory` that calls the gateway. Do not fork Hermes unless a contract test demonstrates a missing required boundary. The memory platform remains independently available through its HTTP/MCP API.

The official provider interface documents lifecycle hooks such as `prefetch`, `sync_turn`, `on_pre_compress` and `on_memory_write`; one external provider is selected at a time [S02](upstream-evidence.md). Exact parameters, threading and error semantics must be read from the pinned version rather than copied from older examples.

## Hook mapping

| Upstream hook | Platform responsibility |
|---|---|
| initialization | Bind authenticated session/delegation and validated workspace scope; never infer security identity from a display name |
| prefetch | Fetch a small authorized context bundle; record its generation and dependencies |
| sync_turn | Persist permitted interaction evidence/episodes or queue candidate proposals, not accepted business facts |
| on_pre_compress | Flush permitted evidence according to the actual durability contract; do not claim success before persistence |
| on_memory_write | Translate a local change into a scoped proposal; local edits never directly approve or erase canonical facts |
| shutdown/session end | Flush durable queues where supported, cancel context reuse and release scoped resources |

Treat hook payloads, tool outputs and conversations as potentially sensitive. Do not send them wholesale to a memory backend. Preserve speaker/source attribution so model output cannot become independent evidence.

## Local memory is a separate leakage surface

Hermes documents persistent local memory and session history; its injected memory snapshot is captured at session start [S03](upstream-evidence.md). A governed external provider does not automatically neutralize local files, session search, prompt caches or runtime tools.

For the pilot, run isolated profiles/homes for each effective security context. Customer agents get no direct filesystem, session-search, repository, source-connector or arbitrary network tools. Avoid writing sensitive business facts into always-injected local memory; use scoped gateway context instead. Audit built-in memory behavior and disable unsafe access paths using verified configuration or a controlled wrapper.

Do not reuse one populated session between PO, developer and customer identities. On scope/grant revocation, invalidate or terminate affected sessions and rebuild fresh context. Remove approved local caches/spills under the retention policy. A model cannot be made to "unsee" revoked text by adding a new instruction.

## Worker separation

Serving agent: scoped read and proposal tools only. Learning worker: bounded authorized source reads, proposal writes and isolated evaluation. Lifecycle executor: explicit plan execution, not general agent reasoning. Human reviewer: authenticated review UI/API, never an agent impersonation token.

A customer agent cannot delegate to a developer worker to obtain hidden facts. Delegated privileges are the intersection of user, agent and task permissions. Worker results must be rechecked before returning to the requesting audience.

## Skill changes

Hermes documents a configurable approval gate for skill writes [S04](upstream-evidence.md). Enable a verified restrictive configuration, then enforce the platform's separate versioned evaluation/approval gate. Local CLI acceptance does not automatically approve a shared enterprise skill or publish it to another project.

Read approved skills on demand. Skill installation, network tools and policy changes require explicit operator authority; source documents cannot install new capabilities.

## Delivery reliability

A local memory-write hook is not a durable transaction with the canonical service. Use a scoped durable queue or explicit acknowledgements for accepted proposals; test retries, crashes and duplicate callbacks. Preserve upstream profile/thread context as required by the pinned interface. Do not assume daemon-thread completion guarantees persistence on process exit.

If exact identity for a local removal is unavailable, open a reconciliation task; do not delete by a fuzzy text match. A local removal must not silently become an enterprise purge.

## Required tests

Profile switching, scope revocation mid-session, delayed callbacks, retries, local session search, prefetch spill files, unapproved memory write, skill write, denied delegation and unavailable gateway. Validate prompt/context capture to prove unauthorized bytes never enter customer model input. Mark unsupported hooks disabled rather than silently best-effort where durability is required.
