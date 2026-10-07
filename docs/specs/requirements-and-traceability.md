# Requirements and Traceability

Status: normative product requirements. `MUST` is required when the owning feature is enabled. M1 requires all non-deferred requirements; F01/F02 capabilities remain disabled until their own gates pass. `SHOULD` is expected unless an explicit decision defers it. Acceptance IDs are defined in [SCENARIOS](../evals/scenarios.md).

| ID | Requirement | Canonical spec | Test | Task |
|---|---|---|---|---|
| REQ-01 | MUST isolate tenant, project, semantic layer and sensitivity | [Authorization and Publication](authorization-and-publication.md) | E01-E05 | M04 |
| REQ-02 | MUST grant guests exact publication versions, not entire facts' future history | [Authorization and Publication](authorization-and-publication.md) | E06-E08 | M08 |
| REQ-03 | MUST preserve atomic claims, exceptions, valid time and source revisions | [Domain Model](domain-model.md), [Ingestion and Evidence](ingestion-and-evidence.md) | E09-E11, E63 | M03, M06 |
| REQ-04 | MUST distinguish clarification from approval | [Fact Review State Machine](fact-review-state-machine.md) | E12-E14, E64 | M05 |
| REQ-05 | MUST support approve/decline with required reason code and note | [Fact Review State Machine](fact-review-state-machine.md), [Review Inbox, Clarification and Notes](review-inbox-and-notes.md) | E15-E17 | M05 |
| REQ-06 | MUST reject stale, unauthorized and self-approved decisions | [Fact Review State Machine](fact-review-state-machine.md), [Events, Concurrency and Consistency](events-and-consistency.md) | E18-E20, E66 | M04, M05 |
| REQ-07 | MUST preserve decline history and require a revised submission | [Fact Review State Machine](fact-review-state-machine.md) | E21-E22 | M05, M06 |
| REQ-08 | MUST exclude unapproved candidates from normal answers and serving projections | [Retrieval and Answer Contract](retrieval-and-answer-contract.md), [Hindsight Adapter](hindsight-adapter.md) | E23-E24 | M07, M09 |
| REQ-09 | MUST separate business approval from publication approval | [Authorization and Publication](authorization-and-publication.md) | E25, E70 | M08 |
| REQ-10 | MUST distinguish intent, code observation and deployment proof | [Ingestion and Evidence](ingestion-and-evidence.md), [Retrieval and Answer Contract](retrieval-and-answer-contract.md) | E26-E27 | M06, M07 |
| REQ-11 | MUST maintain derivation lineage and synchronously block invalidated content | [Lifecycle, Retention and Cleanup](lifecycle-and-cleanup.md), [Events, Concurrency and Consistency](events-and-consistency.md) | E28-E31, E68-E69 | M06–M11 |
| REQ-12 | MUST enforce retention-aware, reviewed destructive cleanup | [Lifecycle, Retention and Cleanup](lifecycle-and-cleanup.md) | E32-E34 | M11 (denial); F02 (execution) |
| REQ-13 | MUST not learn authority from model confidence or copied agent output | [Learning and Skill Governance](learning-and-skill-governance.md) | E35-E37 | M06 |
| REQ-14 | MUST stage, evaluate and approve procedural learning before activation | [Learning and Skill Governance](learning-and-skill-governance.md) | E38-E39 | F01 |
| REQ-15 | MUST isolate Hermes profiles, local history, spills and worker capabilities | [Hermes Adapter and Runtime Boundaries](hermes-adapter.md) | E40-E42 | M02, M10 |
| REQ-16 | MUST provide durable idempotent events, decisions and retry behavior | [Proposed Platform API and MCP Contracts](api-and-mcp-contracts.md), [Events, Concurrency and Consistency](events-and-consistency.md) | E43-E46 | M03, M05, M06, M11; F02 (erasure restore) |
| REQ-17 | MUST fail closed on policy, identity or lineage uncertainty | [Authorization and Publication](authorization-and-publication.md), [Retrieval and Answer Contract](retrieval-and-answer-contract.md) | E47-E48 | M04, M07, M10 |
| REQ-18 | MUST treat ingested instructions as untrusted content | [Security and Threat Model](security-and-threat-model.md) | E49-E50 | M06, M10 |
| REQ-19 | MUST track measurable quality, update lag and review backlog | [Evaluation and Acceptance](../evals/README.md), [Operations and Observability](operations-and-observability.md) | E51-E52 | M11 |
| REQ-20 | MUST pin and contract-test upstream integrations | [Hindsight Adapter](hindsight-adapter.md), [Hermes Adapter and Runtime Boundaries](hermes-adapter.md), [Upstream Evidence and Verification Register](upstream-evidence.md) | E53-E54 | M00–M02, M04, M09, M10 |
| REQ-21 | SHOULD deduplicate unchanged denied candidates without suppressing new evidence | [Fact Review State Machine](fact-review-state-machine.md), [Ingestion and Evidence](ingestion-and-evidence.md) | E22 | M05, M06 |
| REQ-22 | MUST version review notes, corrections and publication receipts without silent edits | [Review Inbox, Clarification and Notes](review-inbox-and-notes.md), [Authorization and Publication](authorization-and-publication.md) | E17, E55 | M05, M08 |
| REQ-23 | MUST avoid count, link, cache and citation side channels | [Authorization and Publication](authorization-and-publication.md), [Retrieval and Answer Contract](retrieval-and-answer-contract.md) | E05, E56-E57 | M04, M07, M08 |
| REQ-24 | MUST resume useful independent work while an unresolved decision remains blocked | [Review Inbox, Clarification and Notes](review-inbox-and-notes.md), [Learning and Skill Governance](learning-and-skill-governance.md) | E58 | M05 |
| REQ-25 | MUST differentiate not-found from permission errors without exposing hidden object existence | [Proposed Platform API and MCP Contracts](api-and-mcp-contracts.md) | E59 | M04 |
| REQ-26 | MUST keep future-effective and historical claims distinct from current truth | [Domain Model](domain-model.md), [Retrieval and Answer Contract](retrieval-and-answer-contract.md) | E60, E65, E69 | M03, M07, M08 |
| REQ-27 | MUST prevent expiry or reviewer silence from causing approval | [Fact Review State Machine](fact-review-state-machine.md), [Review Inbox, Clarification and Notes](review-inbox-and-notes.md) | E61, E67 | M05 |
| REQ-28 | MUST enforce role and evidence-review requirements independently | [Fact Review State Machine](fact-review-state-machine.md), [Authorization and Publication](authorization-and-publication.md) | E62 | M04, M05 |

The spec column links to the canonical owner. Task IDs resolve through the [roadmap](../roadmap.md). Each implementation pull request must reference at least one requirement and test ID. A requirement is not complete merely because an API returns a success code: verify resulting state, audit history, outbox events, retrieval eligibility and unauthorized-access behavior.

## Release rule

Every enabled MUST requirement needs evidence before a real-data pilot. Deferred features must be absent/disabled, with denial tests; disabling a feature does not mark its behavioral scenarios passed. A documented waiver cannot waive isolation, required human approval, source validity, revocation or irreversible-deletion controls. Optional features can be explicitly disabled rather than implemented incompletely.
