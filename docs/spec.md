# Product and architecture

## Product Brief

Status: proposed v0.1 specification. Audience: implementation agents, product owners and reviewers.

### Problem

Business knowledge is distributed across tickets, messages, code and release evidence. Sources change at different rates, contain conflicting statements and have different confidentiality boundaries. A simple memory store can preserve an incorrect inference, expose an internal source through a summary or keep using information after its source is withdrawn.

Build a governed memory service that captures what is known, what is uncertain, who approved it, when it applies, which evidence supports it and who may use it. Learn from changes without confusing machine-generated interpretation with approved truth.

### Users and jobs

| Persona | Job | Default read scope |
|---|---|---|
| PO | Understand approved behavior, unresolved decisions and delivery risks | L2-L4 in assigned projects; review packets where explicitly authorized |
| C-level | Review permitted business facts and progress | L2-L4 across explicitly granted projects; no automatic company-wide access |
| Developer | Trace requirements to implementation and tests | L0-L4 in assigned projects, subject to sensitivity restrictions |
| Guest/customer | Consume a particular shareable fact | Exact publication versions explicitly granted to that principal or group |
| Business approver | Decide whether a candidate accurately represents approved business intent | Assigned review requests; scope-limited authority independent of job title |
| Security/retention operator | Revoke exposure and execute approved maintenance | Narrow operational capabilities, not unrestricted conversational access |

Roles are starting entitlements. Project scope, sensitivity, object grants, source restrictions and action type remain independent.

### Layers and memory types

| Layer/type | Purpose | Examples |
|---|---|---|
| L0 Source | Versioned evidence | Ticket revisions, email messages, commit-pinned files |
| L1 Implementation | Observed implementation structure and behavior | Symbols, routes, schema, tests and deployment records |
| L2 Fact | Atomic reviewed claims | A specific rule, decision or status observation with evidence |
| L3 Business | Approved business structures and explanations | Rule sets, exceptions, rationale and dependencies |
| L4 Progress | Time-stamped delivery views | Milestones, blockers and validated status aggregates |
| Episodic memory | A record of a work episode | A mistaken answer, correction and verified outcome |
| Procedural memory | Versioned ways of working | How to establish that a feature is deployed |

Layers are semantic categories, not security levels. Episodic and procedural memory are parallel types with their own ACLs, provenance and retention. A source's existence does not make the statement inside it approved.

### First milestone: integrated synthetic pilot

One pilot project, one ticket import, one email-thread import and one commit-pinned code import. Start with exported fixtures; live connectors follow only after source authorization. Deliver a review inbox, governed factual query endpoint, exact-version publication endpoint and lifecycle invalidation. Preserve architecture-level tenant isolation from day one.

The refund-policy scenario must run through pinned Hindsight and Hermes integrations. Hindsight must project approved revisions and return resolvable references; Hermes must obtain authorized context through the gateway and demonstrate session isolation. A canonical-only demo does not complete this milestone. Reflection and mental-model synthesis are optional capabilities, disabled until separately proved safe.

Procedure learning, skill activation and irreversible physical cleanup follow after this milestone. Source-change invalidation, publication revocation, durable retries and denial of unauthorized cleanup remain mandatory now. Read the [task graph](https://github.com/canhta/TruthBase/issues) for the delivery boundary.

### Non-goals

No autonomous production code changes. No blanket employee surveillance. No automatic fine-tuning. No customer-facing unrestricted shell or repository tools. No claim that source deletion can erase text a recipient already received. No simultaneous deployment of every memory engine.

### Success definition

A user gets only permitted, eligible content with current lineage. An unclear candidate reaches the right review queue instead of becoming a fact. Every decision is explainable by a concise note and immutable metadata. Updates and revocations stop stale answers before cleanup finishes. Learning changes are evaluated and reversible. See [acceptance](evaluation.md#evaluation-and-acceptance).

## System Architecture

Status: proposed normative architecture. Related: [domain](facts.md#domain-model), [consistency](consistency.md#events-concurrency-and-consistency).

### Logical components

```text
Ticket / Email / Code / Tests / Deployment
                  |
         Authorized ingestion workers
                  |
      Source snapshots + extraction staging
                  |
            Candidate revisions
                  |
       Review service + authorized humans
                  |
   PostgreSQL canonical ledger and eligibility
        |               |              |
  Outbox workers   Publication store   OpenFGA relations
        |               |              |
  Bounded Hindsight projections         |
        +---------------+--------------+
                        |
               Authorized memory gateway
                        |
           PO / C-level / Dev / Guest clients
                        |
            Thin Hermes client adapter

Learning workers -> proposed facts / proposed skills / review tasks
Lifecycle workers -> invalidation / rebuild / authorized cleanup
```

### Ownership and trust

| Component | Owns | Must not own |
|---|---|---|
| Canonical service | Revision identity, review decisions, validity, evidence, revocation barriers | Unreviewed model truth |
| Review service | Assignment, notes, clarification and exact-version decisions | General access-grant administration |
| Authorization service | Relationship checks and policy model version | Content extraction or business correctness |
| Gateway | Authentication, scope resolution, eligibility filtering, answer receipts | Trusting caller-supplied roles or bank IDs |
| Memory backend | Derived recall structures and bounded summaries | Canonical review state or guest grants |
| Hermes adapter | Scoped context exchange and candidate proposals | Direct database, FGA-admin or publication credentials |
| Lifecycle worker | Bounded, logged plans and dependency maintenance | Arbitrary LLM-generated SQL |

Use separate database roles and credentials per service. A single deployment may run several components initially, but retain their capability boundaries. Canonical data and Hindsight's internal schema are separate stores or schemas with separate migrations and permissions; never depend on undocumented engine tables.

### Truth and projection separation

Canonical claims and decisions are written transactionally. Serving projections receive only approved, eligible, authorized-scope content. Quarantined extraction is outside serving banks. Backend observations are derived proposals, not new approved facts.

A memory result is resolved back to exact canonical revisions before use. When a backend cannot provide reliable lineage or enforce the required input boundary, bypass it and retrieve authorized canonical records. The safe fallback may be less fluent; it must not be less governed.

Do not run an unrestricted `reflect` across a mixed-permission bank and filter its final prose. The model would already have read disallowed content. For the pilot, allow only sealed audience partitions with identical input authorization, or use canonical prefiltered retrieval. Guest retrieval bypasses general-purpose memory reflection entirely.

### Storage outline

PostgreSQL stores source metadata, evidence spans, facts, reviews, dependencies, publication objects, jobs, audits and an outbox. Source bytes are held in approved protected storage; use immutable references and hashes. Large source payloads must not be copied into every event.

Search indexes, summaries and embeddings are disposable projections with recorded provenance and generation. They are not backups of the canonical ledger. The minimum pilot may use database full-text search before optimizing vector recall.

### Monorepo layout

One repository contains the deployable apps and their shared domain implementation. Create a directory only when its owning issue adds executable code or configuration; the tree below is the implementation contract, not a claim that the runtime exists.

```text
apps/
  web/                     React/TypeScript, Astryx and browser tests
  api/                     Python HTTP/MCP composition and transport
  worker/                  Python background-job entry points
packages/
  core/                    Python domain/application rules and ports
  adapters/                Python persistence, authorization and vendor adapters
infra/
  docker/                  Compose, image builds and deployment configuration
tests/
  integration/             cross-package DB/policy/adapter checks
  acceptance/              cross-app workflows and adjudicated eval fixtures
docs/                      canonical design contracts only
scripts/                   repository maintenance and verified dev commands
.github/                   CI, contribution forms and ownership
```

Use a root [uv workspace](https://docs.astral.sh/uv/concepts/projects/workspaces/) with one `uv.lock` for Python and a root [pnpm workspace](https://pnpm.io/workspaces) with one `pnpm-lock.yaml` for JavaScript. Declare members explicitly so upstream checkouts and examples cannot become packages. Pin toolchain versions in M00; each member declares its direct dependencies. Keep vendor runtimes outside the application workspace when their dependencies conflict, communicating through the pinned adapter boundary.

Dependencies point inward: API/worker composition imports adapters and core; adapters implement core ports; core imports neither adapters nor applications. Web calls the API and imports neither Python code nor worker internals. Keep authorization rules in core and OpenFGA/persistence clients in adapters. Organize these packages by capability rather than creating a package per class or diagram box. No cross-app source imports, umbrella `utils` package, parallel `services/` tree or duplicate domain rules in TypeScript. Generate frontend API types from the backend schema when needed; never maintain a second handwritten contract.

Python members use `src/<package>/` with unit tests beside that member; browser/component tests belong to `apps/web`. Root tests cover only boundaries spanning members. Canonical migrations belong to the persistence adapter and run through one explicit migration entry point; vendor migrations remain vendor-owned. Keep shared test fixtures only when multiple tests actually need them.

M00 creates the smallest runnable workspace and root developer commands. CI uses locked installs and declared package dependencies; changes to core trigger dependent backend tests, API contracts trigger web compatibility checks, and infra changes trigger deployment smoke checks. Broad monorepo task runners or remote caches require a measured need. Repository navigation stays in README; package READMEs and nested AGENTS files are added only for unique instructions that cannot be inferred from code/configuration.

### Deployment gates

No exposed Hindsight, OpenFGA administration or database port to end users. All user data ingress and egress passes through authenticated services. Model, embedding, tracing and error-reporting destinations must be approved. A self-hosted service does not itself authorize sending client content to an external model.

This architecture does not require Graphiti or Cognee in the first pilot. Add a second engine only after a documented evaluation identifies a capability gap and a consistency budget.

## Requirements and Traceability

Status: normative product requirements. `MUST` is required when the owning feature is enabled. M1 requires all non-deferred requirements; F01/F02 capabilities remain disabled until their own gates pass. `SHOULD` is expected unless an explicit decision defers it. Acceptance IDs are defined in [SCENARIOS](evaluation.md#acceptance-scenario-catalog).

| ID | Requirement | Canonical spec | Test | Task |
|---|---|---|---|---|
| REQ-01 | MUST isolate tenant, project, semantic layer and sensitivity | [Authorization and Publication](access.md#authorization-and-publication) | E01-E05 | [M04](https://github.com/canhta/TruthBase/issues/5) |
| REQ-02 | MUST grant guests exact publication versions, not entire facts' future history | [Authorization and Publication](access.md#authorization-and-publication) | E06-E08 | [M08](https://github.com/canhta/TruthBase/issues/9) |
| REQ-03 | MUST preserve atomic claims, exceptions, valid time and source revisions | [Domain Model](facts.md#domain-model), [Ingestion and Evidence](facts.md#ingestion-and-evidence) | E09-E11, E63 | [M03](https://github.com/canhta/TruthBase/issues/4), [M06](https://github.com/canhta/TruthBase/issues/7) |
| REQ-04 | MUST distinguish clarification from approval | [Fact Review State Machine](facts.md#fact-review-state-machine) | E12-E14, E64 | [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-05 | MUST support approve/decline with required reason code and note | [Fact Review State Machine](facts.md#fact-review-state-machine), [Review Inbox, Clarification and Notes](facts.md#review-inbox-clarification-and-notes) | E15-E17 | [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-06 | MUST reject stale, unauthorized and self-approved decisions | [Fact Review State Machine](facts.md#fact-review-state-machine), [Events, Concurrency and Consistency](consistency.md#events-concurrency-and-consistency) | E18-E20, E66 | [M04](https://github.com/canhta/TruthBase/issues/5), [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-07 | MUST preserve decline history and require a revised submission | [Fact Review State Machine](facts.md#fact-review-state-machine) | E21-E22 | [M05](https://github.com/canhta/TruthBase/issues/6), [M06](https://github.com/canhta/TruthBase/issues/7) |
| REQ-08 | MUST exclude unapproved candidates from normal answers and serving projections | [Retrieval and Answer Contract](access.md#retrieval-and-answer-contract), [Hindsight Adapter](integrations.md#hindsight-adapter) | E23-E24 | [M07](https://github.com/canhta/TruthBase/issues/8), [M09](https://github.com/canhta/TruthBase/issues/10) |
| REQ-09 | MUST separate business approval from publication approval | [Authorization and Publication](access.md#authorization-and-publication) | E25, E70 | [M08](https://github.com/canhta/TruthBase/issues/9) |
| REQ-10 | MUST distinguish intent, code observation and deployment proof | [Ingestion and Evidence](facts.md#ingestion-and-evidence), [Retrieval and Answer Contract](access.md#retrieval-and-answer-contract) | E26-E27 | [M06](https://github.com/canhta/TruthBase/issues/7), [M07](https://github.com/canhta/TruthBase/issues/8) |
| REQ-11 | MUST maintain derivation lineage and synchronously block invalidated content | [Lifecycle, Retention and Cleanup](lifecycle.md#lifecycle-retention-and-cleanup), [Events, Concurrency and Consistency](consistency.md#events-concurrency-and-consistency) | E28-E31, E68-E69 | [M06](https://github.com/canhta/TruthBase/issues/7)–[M11](https://github.com/canhta/TruthBase/issues/12) |
| REQ-12 | MUST enforce retention-aware, reviewed destructive cleanup | [Lifecycle, Retention and Cleanup](lifecycle.md#lifecycle-retention-and-cleanup) | E32-E34 | [M11](https://github.com/canhta/TruthBase/issues/12) (denial); F02 (execution) |
| REQ-13 | MUST not learn authority from model confidence or copied agent output | [Learning and Skill Governance](lifecycle.md#learning-and-skill-governance) | E35-E37 | [M06](https://github.com/canhta/TruthBase/issues/7) |
| REQ-14 | MUST stage, evaluate and approve procedural learning before activation | [Learning and Skill Governance](lifecycle.md#learning-and-skill-governance) | E38-E39 | F01 |
| REQ-15 | MUST isolate Hermes profiles, local history, spills and worker capabilities | [Hermes Adapter and Runtime Boundaries](integrations.md#hermes-adapter-and-runtime-boundaries) | E40-E42 | [M02](https://github.com/canhta/TruthBase/issues/3), [M10](https://github.com/canhta/TruthBase/issues/11) |
| REQ-16 | MUST provide durable idempotent events, decisions and retry behavior | [Proposed Platform API and MCP Contracts](api.md#proposed-platform-api-and-mcp-contracts), [Events, Concurrency and Consistency](consistency.md#events-concurrency-and-consistency) | E43-E46 | [M03](https://github.com/canhta/TruthBase/issues/4), [M05](https://github.com/canhta/TruthBase/issues/6), [M06](https://github.com/canhta/TruthBase/issues/7), [M11](https://github.com/canhta/TruthBase/issues/12); F02 (erasure restore) |
| REQ-17 | MUST fail closed on policy, identity or lineage uncertainty | [Authorization and Publication](access.md#authorization-and-publication), [Retrieval and Answer Contract](access.md#retrieval-and-answer-contract) | E47-E48 | [M04](https://github.com/canhta/TruthBase/issues/5), [M07](https://github.com/canhta/TruthBase/issues/8), [M10](https://github.com/canhta/TruthBase/issues/11) |
| REQ-18 | MUST treat ingested instructions as untrusted content | [Security and Threat Model](access.md#security-and-threat-model) | E49-E50 | [M06](https://github.com/canhta/TruthBase/issues/7), [M10](https://github.com/canhta/TruthBase/issues/11) |
| REQ-19 | MUST track measurable quality, update lag and review backlog | [Evaluation and Acceptance](evaluation.md#evaluation-and-acceptance), [Operations and Observability](lifecycle.md#operations-and-observability) | E51-E52 | [M11](https://github.com/canhta/TruthBase/issues/12) |
| REQ-20 | MUST pin and contract-test upstream integrations | [Hindsight Adapter](integrations.md#hindsight-adapter), [Hermes Adapter and Runtime Boundaries](integrations.md#hermes-adapter-and-runtime-boundaries), [Upstream Evidence and Verification Register](integrations.md#upstream-evidence-and-verification-register) | E53-E54 | [M00](https://github.com/canhta/TruthBase/issues/1)–[M02](https://github.com/canhta/TruthBase/issues/3), [M04](https://github.com/canhta/TruthBase/issues/5), [M09](https://github.com/canhta/TruthBase/issues/10), [M10](https://github.com/canhta/TruthBase/issues/11) |
| REQ-21 | SHOULD deduplicate unchanged denied candidates without suppressing new evidence | [Fact Review State Machine](facts.md#fact-review-state-machine), [Ingestion and Evidence](facts.md#ingestion-and-evidence) | E22 | [M05](https://github.com/canhta/TruthBase/issues/6), [M06](https://github.com/canhta/TruthBase/issues/7) |
| REQ-22 | MUST version review notes, corrections and publication receipts without silent edits | [Review Inbox, Clarification and Notes](facts.md#review-inbox-clarification-and-notes), [Authorization and Publication](access.md#authorization-and-publication) | E17, E55 | [M05](https://github.com/canhta/TruthBase/issues/6), [M08](https://github.com/canhta/TruthBase/issues/9) |
| REQ-23 | MUST avoid count, link, cache and citation side channels | [Authorization and Publication](access.md#authorization-and-publication), [Retrieval and Answer Contract](access.md#retrieval-and-answer-contract) | E05, E56-E57 | [M04](https://github.com/canhta/TruthBase/issues/5), [M07](https://github.com/canhta/TruthBase/issues/8), [M08](https://github.com/canhta/TruthBase/issues/9) |
| REQ-24 | MUST resume useful independent work while an unresolved decision remains blocked | [Review Inbox, Clarification and Notes](facts.md#review-inbox-clarification-and-notes), [Learning and Skill Governance](lifecycle.md#learning-and-skill-governance) | E58 | [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-25 | MUST differentiate not-found from permission errors without exposing hidden object existence | [Proposed Platform API and MCP Contracts](api.md#proposed-platform-api-and-mcp-contracts) | E59 | [M04](https://github.com/canhta/TruthBase/issues/5) |
| REQ-26 | MUST keep future-effective and historical claims distinct from current truth | [Domain Model](facts.md#domain-model), [Retrieval and Answer Contract](access.md#retrieval-and-answer-contract) | E60, E65, E69 | [M03](https://github.com/canhta/TruthBase/issues/4), [M07](https://github.com/canhta/TruthBase/issues/8), [M08](https://github.com/canhta/TruthBase/issues/9) |
| REQ-27 | MUST prevent expiry or reviewer silence from causing approval | [Fact Review State Machine](facts.md#fact-review-state-machine), [Review Inbox, Clarification and Notes](facts.md#review-inbox-clarification-and-notes) | E61, E67 | [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-28 | MUST enforce role and evidence-review requirements independently | [Fact Review State Machine](facts.md#fact-review-state-machine), [Authorization and Publication](access.md#authorization-and-publication) | E62 | [M04](https://github.com/canhta/TruthBase/issues/5), [M05](https://github.com/canhta/TruthBase/issues/6) |
| REQ-29 | MUST provide an accessible Astryx web console with server-enforced scoped administration | [Web administration](#web-administration) | E71 | [M12](https://github.com/canhta/TruthBase/issues/15) |
| REQ-30 | MUST configure Jira, GitHub, inbound email and LLM connections with write-only credentials and distinct bounded probes | [Connection configuration](integrations.md#connection-configuration) | E72-E73 | [M13](https://github.com/canhta/TruthBase/issues/16) |
| REQ-31 | MUST serve independent authenticated Codex and OpenCode clients through the governed MCP boundary | [Independent MCP clients](api.md#independent-mcp-clients) | E74 | [M14](https://github.com/canhta/TruthBase/issues/17) |
| REQ-32 | MUST package the integrated service with Docker, persistent state, protected secrets and verified readiness/recovery | [Docker deployment](lifecycle.md#docker-deployment) | E75 | [M15](https://github.com/canhta/TruthBase/issues/18) |

The spec column links to the canonical owner. Task IDs resolve through the [roadmap](https://github.com/canhta/TruthBase/issues). Each implementation pull request must reference at least one requirement and test ID. A requirement is not complete merely because an API returns a success code: verify resulting state, audit history, outbox events, retrieval eligibility and unauthorized-access behavior.

### Release rule

Every enabled MUST requirement needs evidence before a real-data pilot. Deferred features must be absent/disabled, with denial tests; disabling a feature does not mark its behavioral scenarios passed. A documented waiver cannot waive isolation, required human approval, source validity, revocation or irreversible-deletion controls. Optional features can be explicitly disabled rather than implemented incompletely.

## Web administration

The web console uses React, TypeScript and Astryx. Python remains the backend language. Use one authenticated API and the same policy decisions for browser, MCP and Hermes callers; browser visibility is not an authorization boundary.

| Area | User outcome |
|---|---|
| Access | Inspect scoped principals, roles and exact publication grants; grant or revoke only within delegated authority |
| Review and Publications | Read evidence, resolve clarification, decide with notes, inspect exact versions and publish through separate approval/grant steps |
| Connections | Configure Jira, GitHub, inbound email and LLM destinations; replace credentials, test connectivity and inspect sanitized failures |
| Agents | Connect an independently authenticated Codex or OpenCode client to MCP; inspect scope and revoke agent credentials |
| Operations | Inspect readiness, worker failures and projection lag; Docker lifecycle stays with the deployment operator |

Persist project selection in the UI, but validate scope on every request. Clear previous-project data on scope switch. Preserve draft notes on recoverable errors, make stale-version conflicts explicit, and show loading, empty, denied and failed states separately without exposing hidden objects. Core review/access/settings flows must support keyboard navigation and labelled controls. Avoid a second project-progress dashboard.

The synthetic milestone includes this console, connection configuration and bounded tests, external-agent MCP access, and Docker packaging. Live source synchronization requires a separately scoped connector issue and Q-05 authorization; configuring a connection alone does not enable ingestion. Procedure learning and irreversible cleanup remain deferred.
