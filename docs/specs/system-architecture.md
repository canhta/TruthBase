# System Architecture

Status: proposed normative architecture. Related: [domain](domain-model.md), [consistency](events-and-consistency.md).

## Logical components

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

## Ownership and trust

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

## Truth and projection separation

Canonical claims and decisions are written transactionally. Serving projections receive only approved, eligible, authorized-scope content. Quarantined extraction is outside serving banks. Backend observations are derived proposals, not new approved facts.

A memory result is resolved back to exact canonical revisions before use. When a backend cannot provide reliable lineage or enforce the required input boundary, bypass it and retrieve authorized canonical records. The safe fallback may be less fluent; it must not be less governed.

Do not run an unrestricted `reflect` across a mixed-permission bank and filter its final prose. The model would already have read disallowed content. For the pilot, allow only sealed audience partitions with identical input authorization, or use canonical prefiltered retrieval. Guest retrieval bypasses general-purpose memory reflection entirely.

## Storage outline

PostgreSQL stores source metadata, evidence spans, facts, reviews, dependencies, publication objects, jobs, audits and an outbox. Source bytes are held in approved protected storage; use immutable references and hashes. Large source payloads must not be copied into every event.

Search indexes, summaries and embeddings are disposable projections with recorded provenance and generation. They are not backups of the canonical ledger. The minimum pilot may use database full-text search before optimizing vector recall.

## Suggested implementation shape

```text
services/gateway/           HTTP and MCP surface
services/worker/            ingestion, projection, learning, lifecycle
packages/domain/            types, transition guards, policies
packages/authorization/     identity, OpenFGA and DB guard integration
packages/adapters/          source, Hindsight and Hermes adapters
migrations/                canonical migrations only
contracts/                 generated API/event schemas
tests/unit/               pure rules
tests/integration/        real DB and policy boundaries
tests/acceptance/         eval scenario implementations
```

Paths above are planned, not present. Start with Python/FastAPI as a proposed shared implementation language because the custom Hermes adapter can remain Python; exact runtime versions are an M00 decision. Another stack requires a recorded decision, not an implicit rewrite.

## Deployment gates

No exposed Hindsight, OpenFGA administration or database port to end users. All user data ingress and egress passes through authenticated services. Model, embedding, tracing and error-reporting destinations must be approved. A self-hosted service does not itself authorize sending client content to an external model.

This architecture does not require Graphiti or Cognee in the first pilot. Add a second engine only after a documented evaluation identifies a capability gap and a consistency budget.
