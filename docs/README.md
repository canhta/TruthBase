# Documentation

Start with [project state](../PROJECT_STATE.md) and one [GitHub issue](roadmap.md). Load only the contracts for that issue. [CONTEXT](../CONTEXT.md) defines terminology; [decisions](adr/decisions.md) records design choices and owner questions.

## Product contracts

| Concern | Authoritative document |
|---|---|
| Goal and milestone scope | [Product brief](specs/product-brief.md) |
| Requirement coverage | [Traceability](specs/requirements-and-traceability.md) |
| Components and trust boundaries | [Architecture](specs/system-architecture.md) |
| Fields, enums and temporal replacement | [Domain model](specs/domain-model.md) |
| Clarify, approve, decline, renew | [Fact review](specs/fact-review-state-machine.md) |
| Human review UI and notes | [Review inbox](specs/review-inbox-and-notes.md) |
| Access and exact-version publication | [Authorization](specs/authorization-and-publication.md) |
| Source import and evidence | [Ingestion](specs/ingestion-and-evidence.md) |
| Query modes and answer shape | [Retrieval](specs/retrieval-and-answer-contract.md) |
| Learning and skill activation | [Learning](specs/learning-and-skill-governance.md) |
| Invalidation, retention and purge | [Lifecycle](specs/lifecycle-and-cleanup.md) |
| Requests, errors and tools | [API/MCP](specs/api-and-mcp-contracts.md) |
| Transactions, retries and release ordering | [Consistency](specs/events-and-consistency.md) |
| Memory backend | [Hindsight](specs/hindsight-adapter.md) |
| Agent provider and local context | [Hermes](specs/hermes-adapter.md) |
| Threats and controls | [Security](specs/security-and-threat-model.md) |
| Metrics and recovery | [Operations](specs/operations-and-observability.md) |
| Upstream observations and source snapshots | [Upstream register](specs/upstream-evidence.md) |
| Canonical serialization | [Digests and vectors](contracts/digests.md) |
| Model-facing instructions | [Runtime prompts](specs/runtime-prompts.md) |

## Engineering and evidence

[Engineering rules](agents/engineering.md) own coding, meaningful test selection, review and local handoff. Matt skills read [tracker conventions](agents/issue-tracker.md), [triage labels](agents/triage-labels.md) and [domain reading rules](agents/domain.md).

[Evaluation contract](evals/README.md) owns test layers, release gates, dataset format and scorecards. [Scenarios](evals/scenarios.md) defines the individual behaviors to verify; entries are specifications, not passing results.

Worked examples: [review](examples/01-approval-decline-clarification.md), [access](examples/02-authorization-matrix.md), [source changes](examples/03-source-change-and-erasure.md), [API payloads](examples/04-api-payloads.md). Examples illustrate contracts and do not override them.
