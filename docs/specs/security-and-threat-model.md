# Security and Threat Model

Status: required design and test checklist. This is an engineering specification, not a certification or legal-compliance claim.

## Protected assets

Client code, email, business rules, review notes, credentials, source permissions, customer publications, learned procedures, audit records, conversation history and model-provider payloads. Treat indexes, embeddings, caches and logs as potentially sensitive derivatives.

## Threats and controls

| Threat | Required control | Test |
|---|---|---|
| Prompt injection in a ticket/email/code comment | Treat input as data; fixed tool capabilities; no source-driven approvals or tool installation | E49-E50 |
| Cross-project leakage | Validated scope, object checks, DB guards and isolated partitions | E01-E05 |
| Summary or graph-traversal leakage | Authorized input construction and full dependency checks | E24, E56 |
| Guessed fact/publication IDs | Non-enumerable scoped reads; indistinguishable not-found response | E59 |
| Approval replay or stale review | Digests, policy version, optimistic concurrency and idempotency | E18-E20, E43 |
| Confused-deputy worker | Intersection of delegated permissions; different credentials by task | E41 |
| Stored agent-output poisoning | Derivative provenance; no self-corroboration | E35-E37 |
| Local memory/session leakage | Isolated Hermes homes, no guest local history tools, context invalidation | E40-E42 |
| Permission change during answer | Canonical revocation barrier and final validation; no sensitive streaming | E29, E57 |
| Unsafe maintenance | Dry-run, plan-bound approval, no arbitrary SQL, generation guards | E32-E34 |
| External processor leakage | Approved destinations for LLM, embeddings, reranking, traces and errors | E48 |
| Supply-chain compromise | Pinned versions, license/dependency review and isolated execution | E53-E54 |

## Identity and privileges

Use short-lived delegated tokens where feasible. No shared global admin token in agent configuration. Keep OpenFGA administration, migrations, cleanup execution and source ingestion credentials separate. Administrative support access must be time-bounded, explicit and audited; it is not automatically conversational access to every customer's data.

Protect against horizontal access escalation on all endpoints, including notes, jobs, audit events and exports. Validate scope inside the transaction, not only in the UI. Connection pool state must not carry tenant identity across requests.

## Source execution and network policy

Do not execute imported repository code or attachments during ordinary ingestion. Sandbox explicitly authorized execution with restricted filesystem, network and credentials. Block implicit dependency installation from retrieved instructions. Limit outbound destinations and payloads; self-hosting one component does not authorize third-party model processing.

Credentials discovered in a source are restricted incident content, not useful reusable memory. Redact or isolate them and notify the authorized owner. Do not copy secrets into notes, evaluation fixtures, prompts or examples.

## Logging and auditing

Log opaque object IDs, policy outcomes, versions, latency and error categories. Avoid full prompts and source text in standard telemetry. Restricted debug capture must be explicit, time-limited and governed by retention. A reviewer note has its own access policy; operational logs must not reproduce it.

Audit approval, decline, clarification, grants, publication, suspension, cleanup, skill activation and administrative overrides. Tamper evidence should protect decision integrity without making required content redaction impossible.

## Revocation limits

Block future serving immediately at the defined acknowledgement boundary. Terminate affected active contexts and invalidate derivatives. Record externally delivered data that cannot be recalled. Do not claim erasure from a model provider, backup or user's downloaded file without a verified mechanism.

## Release gate

No real client data until exact dependency versions, approved model endpoints, source permissions, reviewer roles and deletion/retention ownership are recorded. All security-critical tests for enabled paths and denial tests for disabled paths must pass, following the [milestone gates](../evals/README.md#hard-release-gates). A demonstration with synthetic data is not a completed production security review.
