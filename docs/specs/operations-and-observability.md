# Operations and Observability

Status: proposed operating design. Implement metrics without copying sensitive memory content into telemetry.

Only expose metrics/runbooks for enabled capabilities. F01 learning and F02 physical-cleanup execution are deferred; report them as disabled rather than healthy zero. M1 still requires source invalidation, revocation, retry and restore evidence.

## Operator views

| View | Decision it supports | Signals |
|---|---|---|
| Review health | Reassign or clarify blocked work | Pending age, unresolved questions, missing approver scope |
| Knowledge freshness | Fix stale sources or projections | Source lag, approval-to-projection lag, stale/blocked derivatives |
| Access health | Stop possible exposure | Denied requests, unexpected scope, stale grants, active-context invalidations |
| Lifecycle health | Recover incomplete maintenance | Revocation backlog, cleanup receipts, unresolved holds, reinsert attempts |
| Learning health | Approve or reject improvement | Evaluation deltas, regressions, proposed/active skill versions |
| Platform health | Scale or recover services | Queue age, error rate, retries, policy availability, query latency and cost |

Do not show operator-wide content bodies unless explicitly authorized. Counts and cross-project aggregates must follow the operator's scope.

## Service-level indicators

Track event-to-candidate lag, approved-to-ready lag, invalidation acknowledgement, invalidation completion, physical deletion completion, query latency, review-note completeness and orphan derivative count. Attach denominators and observation windows. Distinguish no data from healthy zero.

Alert immediately on attempted cross-tenant access, unapproved content in a serving projection, missing dependency manifests, revocation drift and cleanup targeting a protected object. Rate-limit repetitive alarms but preserve the incident's full event history.

## Minimal runbooks

### Policy service unavailable

Fail closed for affected requests. Return a safe retryable error. Do not switch to cached global memory. Check service health and pinned policy model; restore, reconcile grants, then rerun policy boundary tests.

### Memory backend unavailable

Use authorized canonical retrieval only if canonical eligibility and policy are healthy. Queue projection retries. Never convert an engine outage into a bypass of approval checks.

### Source permission removed

Commit restriction and invalidate affected content immediately. Distinguish permission loss from confirmed deletion. Assess independent evidence and publication authority. Rebuild contexts only after valid reauthorization.

### Stale or contaminated summary

Suspend the artifact or partition; trace all inputs and affected publications/skills. Rebuild from eligible inputs or withdraw. Verify absence of unsupported text before reopening reads. Record incident and add a regression case.

### Cleanup partially failed

Keep serving blocked. Report the completed and outstanding stores. Retry idempotently under the approved plan or issue a new plan if generations changed. Do not label the job complete because one backend returned success.

### Backup restore

Restore into an isolated environment. Replay revocation and erasure tombstones, reconcile grants and projections, verify hold/retention conditions, and run security scenarios before permitting user traffic.

## Configuration ownership

Security owner controls model egress, identity/delegation and policy administration. Business owner controls fact-review authority. Publication owner controls external-release policy. Retention owner controls durations/holds and purge approvals. Engineering controls versioned deployment configuration within those boundaries.

## Deployment evidence

Record exact application and dependency versions, schema migration version, authorization model ID, model/embedding configuration, source connector scope, enabled auto-actions and evaluated dataset version. Secrets are referenced through a secret store, never written into documentation.
