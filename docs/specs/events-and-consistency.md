# Events, Concurrency and Consistency

Status: normative. Assume at-least-once delivery, retries and out-of-order events. Never promise exactly-once transport.

## Event envelope

```json
{
  "event_id": "EV-demo-001",
  "event_type": "fact.review_declined.v1",
  "tenant_id": "TEN-demo",
  "project_id": "PRJ-atlas",
  "aggregate_type": "fact",
  "aggregate_id": "FACT-refund",
  "aggregate_version": 7,
  "occurred_at": "2026-10-07T02:00:00Z",
  "actor_ref": "USR-reviewer-1",
  "correlation_id": "COR-demo-001",
  "causation_id": "CMD-demo-001",
  "payload": {
    "fact_revision_id": "FR-refund-002",
    "decision_id": "DEC-demo-001",
    "note_id": "NOTE-demo-001",
    "eligibility_generation": 12
  }
}
```

Events contain scoped IDs and minimal metadata, not copied private source text or reviewer notes. Consumers fetch any necessary content under service authorization. Event schemas are versioned; reject unsupported major versions into a restricted dead-letter queue.

## Event catalog

| Event | Main consumer effect |
|---|---|
| `source.revision_ingested.v1` | Extract/deduplicate candidates |
| `source.restricted.v1` | Enforce barrier and assess descendants |
| `source.retracted.v1` | Suspend dependent eligibility and reconcile evidence |
| `fact.revision_created.v1` | Update review workspace only |
| `fact.clarification_requested.v1` | Notify authorized owner; no serving projection |
| `fact.clarification_resolved.v1` | Permit fresh approval submission if unchanged |
| `fact.review_approved.v1` | Queue eligible approved projection |
| `fact.review_declined.v1` | Persist suppression key and review history; no serving projection |
| `review.request_expired.v1` | Preserve unapproved state and expose renewal eligibility |
| `review.request_renewed.v1` | Link old closed request to new exact-target request |
| `review.request_reassigned.v1` | Update authorized queue owner without changing content |
| `review.request_cancelled.v1` | Close obsolete request without approving its target |
| `fact.supersession_scheduled.v1` | Record approved predecessor/successor interval; serving also evaluates time directly |
| `fact.withdrawn.v1` | Close proposal work and cancel pending review |
| `fact.suspended.v1` | Invalidate every affected serving derivative |
| `fact.superseded.v1` | Refresh current views; preserve permitted history |
| `publication.approved.v1` | Make eligible for separate grant activation |
| `publication.grant_changed.v1` | Reconcile access and invalidate affected caches |
| `publication.revoked.v1` | Enforce denial and downstream cleanup |
| `skill.proposed.v1` | Queue isolated evaluation |
| `skill.activated.v1` | Deploy exact approved content to allowed runtimes |
| `cleanup.plan_approved.v1` | Make plan executable, not automatically executed |
| `cleanup.completed.v1` | Record declared per-store completion receipts |

## Canonical transaction

For a human decision, lock or compare-and-swap the request and fact aggregate. Recheck actor authority, policy, content/evidence digests and blockers. Insert note and decision, update state, increment versions/eligibility where applicable, and insert the outbox event in one database transaction. Roll back all changes on failure.

A projection worker never changes a fact to approved. An engine write success is not canonical approval. Mark each projection `pending`, `ready`, `failed`, or `invalidated` independently from fact review state.

## Consumer idempotency

Maintain a processed-event/inbox table per consumer. Side effects use stable target identities and source aggregate versions. At-least-once replay must not duplicate a note, decision, publication, backend memory or external notification.

If a backend cannot offer idempotent update semantics, reconcile by stable mapping plus generation and verify the resulting object before marking the event complete. Do not mark success before a durable result is recorded.

## Ordering

Use monotonic aggregate versions. Reject stale updates that would regress canonical state. Consumers can skip a stale projection update but must never skip a still-applicable erasure or revocation barrier. Cross-aggregate dependencies require explicit manifests and generation checks; ordering by wall-clock timestamps alone is insufficient.

A deleted source replayed by an old connector event remains blocked by its tombstone. A newer valid revision is evaluated as a new scoped source, not an automatic restoration of prior access.

## Cross-store authorization saga

PostgreSQL and OpenFGA updates are not a distributed atomic transaction in this design. For a grant, stage the canonical grant, write/verify the relationship, then mark active. For a revocation, commit canonical denial first, then remove/reconcile external relations. Gateway checks both, so incomplete grants deny and incomplete revocations still deny.

Workers reconcile drift and retries. Policy-model changes require version pins and migration tests. An event log is not permission to replay source text into an unapproved destination.

## Response consistency

A request captures dependency and authorization generations before generation, then validates them immediately before release. If any changed, discard/retry or return a temporary failure. For strict revocation behavior, serialize final release validation against the canonical barrier and define the acknowledged-revocation boundary in tests. Requests already delivered before that boundary cannot be recalled.

No sensitive streaming in the pilot. Live agent sessions holding revoked content must be invalidated or terminated; fresh retrieval alone does not sanitize a persistent prompt.

## Retry and recovery

Use bounded exponential backoff with jitter; distinguish transient failures from permanent validation failures. Record attempt count and next retry. Dead-letter exhausted jobs with scoped operator access. Alert on backlog age, especially revocation and cleanup jobs. Keep serving blocked while a security-critical job is unresolved.

Run a periodic reconciliation over canonical eligibility, projection mappings, grants and tombstones. Reconciliation is required because a durable outbox reduces but does not eliminate implementation or operational faults.

## Authority and release linearization

Every policy or relationship change that can remove authority must pass through a canonical scope authorization generation/barrier. Direct production relationship administration bypassing this gateway is outside the supported operating model. If synchronization cannot be established, deny decisions and serving for the affected scope until reconciled.

A decision captures the authorization generation, policy version and verified relationship result. Its database transaction locks/checks the same canonical authority row used by revocation, then rechecks these values before committing the note, decision and outbox. Revocation/policy mutation increments that row under the same lock. If revocation commits first, the stale decision fails; if the decision commits first, its historical approval is retained and later serving still rechecks present barriers. No database transaction is claimed to make OpenFGA atomic. Grants become effective only after verified relationship writes and canonical activation.

Final response release and revocation acknowledgement must use a common per-scope release gate across all serving processes. While holding it, release rechecks authority, dependency generations and effective time before handing the bounded response to the transport. Revocation waits for already admitted handoffs to finish, durably commits denial, then acknowledges. Later handoffs are denied. This boundary covers server handoff, not the time a remote client receives previously sent network bytes. Do not claim recall of bytes already handed off. M07 must implement/test this gate; a check followed by an unlocked socket write is insufficient.

Use a bounded write deadline and abort a stalled handoff so revocation cannot wait indefinitely. The concrete transport/gate mechanism must be recorded and fault-tested for the declared process topology before serving is enabled. The initial deployment may use one serving process with a shared gate; adding processes requires cross-process coordination tests. Synthetic single-process proof is not a distributed-release claim.
