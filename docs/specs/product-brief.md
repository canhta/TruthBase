# Product Brief

Status: proposed v0.1 specification. Audience: implementation agents, product owners and reviewers.

## Problem

Business knowledge is distributed across tickets, messages, code and release evidence. Sources change at different rates, contain conflicting statements and have different confidentiality boundaries. A simple memory store can preserve an incorrect inference, expose an internal source through a summary or keep using information after its source is withdrawn.

Build a governed memory service that captures what is known, what is uncertain, who approved it, when it applies, which evidence supports it and who may use it. Learn from changes without confusing machine-generated interpretation with approved truth.

## Users and jobs

| Persona | Job | Default read scope |
|---|---|---|
| PO | Understand approved behavior, unresolved decisions and delivery risks | L2-L4 in assigned projects; review packets where explicitly authorized |
| C-level | Review permitted business facts and progress | L2-L4 across explicitly granted projects; no automatic company-wide access |
| Developer | Trace requirements to implementation and tests | L0-L4 in assigned projects, subject to sensitivity restrictions |
| Guest/customer | Consume a particular shareable fact | Exact publication versions explicitly granted to that principal or group |
| Business approver | Decide whether a candidate accurately represents approved business intent | Assigned review requests; scope-limited authority independent of job title |
| Security/retention operator | Revoke exposure and execute approved maintenance | Narrow operational capabilities, not unrestricted conversational access |

Roles are starting entitlements. Project scope, sensitivity, object grants, source restrictions and action type remain independent.

## Layers and memory types

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

## First milestone: integrated synthetic pilot

One pilot project, one ticket import, one email-thread import and one commit-pinned code import. Start with exported fixtures; live connectors follow only after source authorization. Deliver a review inbox, governed factual query endpoint, exact-version publication endpoint and lifecycle invalidation. Preserve architecture-level tenant isolation from day one.

The refund-policy scenario must run through pinned Hindsight and Hermes integrations. Hindsight must project approved revisions and return resolvable references; Hermes must obtain authorized context through the gateway and demonstrate session isolation. A canonical-only demo does not complete this milestone. Reflection and mental-model synthesis are optional capabilities, disabled until separately proved safe.

Procedure learning, skill activation and irreversible physical cleanup follow after this milestone. Source-change invalidation, publication revocation, durable retries and denial of unauthorized cleanup remain mandatory now. Read the [task graph](../roadmap.md) for the delivery boundary.

## Non-goals

No autonomous production code changes. No blanket employee surveillance. No automatic fine-tuning. No customer-facing unrestricted shell or repository tools. No claim that source deletion can erase text a recipient already received. No simultaneous deployment of every memory engine.

## Success definition

A user gets only permitted, eligible content with current lineage. An unclear candidate reaches the right review queue instead of becoming a fact. Every decision is explainable by a concise note and immutable metadata. Updates and revocations stop stale answers before cleanup finishes. Learning changes are evaluated and reversible. See [acceptance](../evals/README.md).
