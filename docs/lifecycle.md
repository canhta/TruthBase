# Lifecycle and operations

## Learning and Skill Governance

Status: normative for the enabled feature. Knowledge proposals and anti-poisoning apply in M1; procedure evaluation/activation is deferred to F01. "Self-learning" means governed knowledge and procedure updates, not autonomous model-weight training.

### Three learning loops

| Loop | Trigger | Output | Activation gate |
|---|---|---|---|
| Knowledge | New or changed authorized source | Candidate fact revision, evidence or conflict | Fact review and eligibility |
| Experience | Verified correction or observed outcome | Scoped episode and regression test | Verification before use as evidence |
| Procedure | Repeated verified failure or improvement opportunity | Proposed skill revision | Evaluation, security review and approval |

An agent may propose and investigate; it does not grant itself authority to accept, share, delete or deploy. High confidence, positive feedback and repetition do not count as approval.

### Correction-to-learning workflow

Capture the original answer receipt and permitted inputs. Record the correction as a note by an identified actor. Establish the actor's authority and find independent supporting evidence. Create a candidate fact revision if the knowledge changed. Add a regression case that captures the mistake without exposing production data. Propose a scoped procedure change only if a generalizable failure is demonstrated.

Example: "Jira Done means released" was incorrect for a project. The new skill requires deployment evidence before asserting release. The skill does not change the project's business workflow by itself.

A user's assertion may be valuable but still unverified. Preserve `verified_outcome=false` until evidence or an authorized decision supports it. The original agent output and summaries of it are derivative evidence, never independent corroboration.

### Skill lifecycle

```text
proposed -> evaluating -> pending_approval -> approved -> active
    |            |               |
 declined     declined        declined
active -> retired or revoked
```

A skill revision includes scope, purpose, trigger, allowed tools, forbidden actions, steps, dependencies, rollback strategy, test cases and measured evaluation results. Revisions are immutable. Activation requires the approved exact content digest and deployment permission. Changed content returns to proposal; it does not inherit approval.

The person approving a procedure must have `approve_skill`; a fact approval does not confer this right. A project-specific skill must not become a global skill without a separately reviewed sanitized revision. Skill instructions are untrusted until admitted; they cannot override runtime capability limits.

Hermes has a skills system and a configurable skill-write approval gate [S04](integrations.md#upstream-evidence-and-verification-register). The platform's independent evaluation, lineage and cross-agent publication workflow is custom work, not a claimed upstream feature.

### Evaluation

Run the changed scenario plus the existing regression suite against baseline and proposed versions. Include wrong-scope, unauthorized-source, missing-evidence and adversarial-source cases. Use deterministic assertions for state and permissions. Use human adjudication or a calibrated evaluator for semantic quality; do not let the proposing agent be the only judge.

Require no safety regressions and evidence of the intended improvement. Compare cost and latency under identical fixtures. A decline records a note and preserves the failed version; later improvement uses a new revision. Evaluation failure does not delete evidence of the attempt.

### Active discovery

Workers may identify missing implementation links, conflicting rules or stale evidence. They create bounded tasks, fetch only authorized sources and stop at budget or authority limits. Proposed initial budgets are 20 tool calls and one clarification request per deduplicated issue; owners may change them in versioned policy.

When blocked, preserve progress and continue independent permitted work. Do not repeatedly ask the same question, auto-escalate permissions or guess a missing answer. A clarification request is a durable work item, not a claim of completed research.

### Anti-poisoning rules

Reject instructions embedded in tickets, code comments and emails that attempt to change approval policy, disable security, add tools or publish secrets. Source text may describe an instruction as business content, but it cannot execute it. Normalize copied citations to their origin to prevent fake corroboration.

Retain an access-controlled correction history and failure taxonomy. Use this for evaluation and routing, not employee-ranking by default. Traceable improvement matters more than accumulating memory volume.

### Forgetting learned procedures

A source retraction, revoked fact or discovered skill vulnerability suspends dependent active skills before replacement evaluation. Review the dependency manifest; rebuild or retire as appropriate. Low usage alone is insufficient grounds to delete rare but important incident procedures.

## Lifecycle, Retention and Cleanup

Status: normative. Distinguish immediate serving invalidation from eventual physical deletion.

### Maintenance operations

| Operation | Meaning | Default gate |
|---|---|---|
| Deduplicate | Merge exact redundant records while preserving provenance | Deterministic policy; semantic merges require review |
| Supersede | Mark an approved old version as replaced for current queries | Approved replacement plus effective-time handling |
| Suspend | Stop serving because evidence, authority or access is in doubt | Authorized event/policy; note required |
| Archive | Remove from active search while retaining controlled history | Retention policy |
| Rebuild | Regenerate a derivative from valid permitted inputs | Worker policy and dependency checks |
| Purge | Irreversibly remove target content from covered stores | Approved cleanup plan and retention checks |
| Revoke publication | Immediately deny external reads | Scoped authority; durable barrier before acknowledgement |

### Dependency manifest

Every derived fact/view/skill/publication records complete input object IDs and versions, hashes, audience, source ACL generation, transformation/model/prompt version and output generation. Keep all input dependencies, not only the citations the model chose to show. If precise provenance is unavailable, record the full input set conservatively. Unknown lineage makes a derivative ineligible for serving.

Graph edges support source-to-evidence-to-fact-to-summary/skill/publication traversal. Changes to access can invalidate content without changing its meaning. Changes to evidence may require new reviewed revisions.

### Invalidation protocol

1. Validate the source-change/retraction/revocation event and its scope.
2. In one canonical transaction record the event, suspend affected serving eligibility or raise a project/audience generation barrier, and append outbox work.
3. Serving immediately denies stale generations. For a large dependency fanout, block the entire affected partition until traversal finishes rather than serving a partial stale closure.
4. Workers find descendants, assess surviving evidence, rebuild or withdraw derivatives and reconcile backend memory/index records.
5. Re-enable only derivatives whose dependencies and policy generations were verified. Content changes that affect a reviewed claim require a new revision and approval.
6. Record per-store receipts and retries. Emit completion only when the declared maintenance scope is satisfied.

A source removal does not automatically disprove every dependent fact. Independent valid evidence may survive, but the old dependency manifest cannot silently remain eligible. Keep content suspended while deciding what remains supported.

### Hindsight-specific caution

The documented mental-model staleness flag does not by itself detect deletion [S07](integrations.md#upstream-evidence-and-verification-register). The adapter must explicitly invalidate affected models and verify rebuild/removal. A refresh that returns successfully is not proof that unsupported text disappeared. If no support remains, withdraw or delete the model rather than trusting an empty refresh.

### Cleanup plan

Required fields: plan ID; scope; operation; exact targets and expected generations; dependency impact; justification note; policy version; retention/hold checks; backup implications; reversible/irreversible classification; required approvers; dry-run findings; execution limits; rollback/compensation plan; completion criteria.

Dry-run is mandatory before irreversible execution. Bind approval to the plan digest and target generations. Any material target change requires a new plan. Agents may propose plans; a narrow executor performs only allowed operations. Never execute model-written arbitrary SQL.

Proposed pilot policy: exact cache expiry and rebuilding invalidated derivatives may run automatically. Purging source content, approved facts, review history or skills requires explicit owner approval and a security/retention check. Cross-tenant cleanup is forbidden.

### Retention and holds

Retention durations are owner decisions, not invented legal rules. Defaults for the synthetic pilot may be short and disposable; real-data pilot requires approved durations. A preservation hold blocks destructive purge but does not force serving revoked information. A hold/purge conflict pauses deletion and routes to the designated owner.

A decline is not an erasure instruction. Keep declined candidates and notes according to policy, outside normal factual retrieval. Sensitive-note redaction uses an audited process and does not silently reverse a review decision.

### Physical deletion scope

Cover source payloads, canonical content, backend memories, observations, mental models, embeddings, search indexes, caches, exports, logs containing content, local agent files, prefetch spill files, session history, evaluation copies and relevant backups. Do not claim completion for stores that were not checked.

Use minimal non-content tombstones to prevent reinsertion by old events or restores. Hashes can themselves be sensitive for low-entropy values; avoid storing unnecessary reconstructable evidence in a tombstone. Replay erasure/revocation tombstones after restore and before reopening reads. Backup removal follows the declared retention mechanism and must have a separate completion/expiry record.

Data already delivered to a user or external provider may not be retractable through this system. Record affected processors/destinations and required actions; do not promise total remote erasure without a verified mechanism.

### Out-of-order events and races

Old source events cannot resurrect purged content or overwrite newer revision state. Cleanup rechecks target generation and hold status at execution time. An approved plan does not authorize deletion of new revisions created after the plan. Retry each target idempotently and report partial completion honestly.

### Recovery

Rollback for suspension is a new authorized revalidation event, not deletion of the audit trail. Irreversible purge has no content rollback; only approved backups under applicable policy can restore permissible content, followed by tombstone reconciliation. A worker crash must not reopen serving eligibility.

## Operations and Observability

Status: proposed operating design. Implement metrics without copying sensitive memory content into telemetry.

Only expose metrics/runbooks for enabled capabilities. F01 learning and F02 physical-cleanup execution are deferred; report them as disabled rather than healthy zero. M1 still requires source invalidation, revocation, retry and restore evidence.

### Operator views

| View | Decision it supports | Signals |
|---|---|---|
| Review health | Reassign or clarify blocked work | Pending age, unresolved questions, missing approver scope |
| Knowledge freshness | Fix stale sources or projections | Source lag, approval-to-projection lag, stale/blocked derivatives |
| Access health | Stop possible exposure | Denied requests, unexpected scope, stale grants, active-context invalidations |
| Lifecycle health | Recover incomplete maintenance | Revocation backlog, cleanup receipts, unresolved holds, reinsert attempts |
| Learning health | Approve or reject improvement | Evaluation deltas, regressions, proposed/active skill versions |
| Platform health | Scale or recover services | Queue age, error rate, retries, policy availability, query latency and cost |

Do not show operator-wide content bodies unless explicitly authorized. Counts and cross-project aggregates must follow the operator's scope.

### Service-level indicators

Track event-to-candidate lag, approved-to-ready lag, invalidation acknowledgement, invalidation completion, physical deletion completion, query latency, review-note completeness and orphan derivative count. Attach denominators and observation windows. Distinguish no data from healthy zero.

Alert immediately on attempted cross-tenant access, unapproved content in a serving projection, missing dependency manifests, revocation drift and cleanup targeting a protected object. Rate-limit repetitive alarms but preserve the incident's full event history.

### Minimal runbooks

#### Policy service unavailable

Fail closed for affected requests. Return a safe retryable error. Do not switch to cached global memory. Check service health and pinned policy model; restore, reconcile grants, then rerun policy boundary tests.

#### Memory backend unavailable

Use authorized canonical retrieval only if canonical eligibility and policy are healthy. Queue projection retries. Never convert an engine outage into a bypass of approval checks.

#### Source permission removed

Commit restriction and invalidate affected content immediately. Distinguish permission loss from confirmed deletion. Assess independent evidence and publication authority. Rebuild contexts only after valid reauthorization.

#### Stale or contaminated summary

Suspend the artifact or partition; trace all inputs and affected publications/skills. Rebuild from eligible inputs or withdraw. Verify absence of unsupported text before reopening reads. Record incident and add a regression case.

#### Cleanup partially failed

Keep serving blocked. Report the completed and outstanding stores. Retry idempotently under the approved plan or issue a new plan if generations changed. Do not label the job complete because one backend returned success.

#### Backup restore

Restore into an isolated environment. Replay revocation and erasure tombstones, reconcile grants and projections, verify hold/retention conditions, and run security scenarios before permitting user traffic.

### Configuration ownership

Security owner controls model egress, identity/delegation and policy administration. Business owner controls fact-review authority. Publication owner controls external-release policy. Retention owner controls durations/holds and purge approvals. Engineering controls versioned deployment configuration within those boundaries.

### Deployment evidence

Record exact application and dependency versions, schema migration version, authorization model ID, model/embedding configuration, source connector scope, enabled auto-actions and evaluated dataset version. Secrets are referenced through a secret store, never written into documentation.

## Worked Example - Source Update, Retraction and Erasure

Synthetic dependency graph:

```text
SRC-email-1@r1 -> EV-email-1 -> FR-refund-003
                                 |-> VIEW-policy-1
                                 |-> VIEW-progress-1
                                 |-> PUB-refund-001
                                 |-> SKILL-release-check@v2
                                 |-> engine projection MP-1
                                 |-> cache/context receipts
```

### Case A: an ordinary proposed change

A new ticket proposes a 60-day window. Create a new candidate, not a silent replacement. FR-003 remains current if its evidence/authority remains valid and the proposal is not a material contradiction. The new claim requires its own review. An authorized review workspace may show the change request, labeled as proposed. It does not enter current factual answer context.

### Case B: authoritative retraction

The business owner retracts the email decision. Validate authority and commit a source-retraction event plus an eligibility barrier. Block FR-003-dependent serving paths, including PUB-001, before asynchronous cleanup. Preserve historical decisions, but historical access cannot bypass the current restriction.

The dependency worker inspects all listed descendants, not just the visible citation list. If some independent eligible evidence supports a claim, create/approve a corrected revision where needed. If support is gone, withdraw the corresponding summary/publication and suspend the skill. A successful backend refresh that leaves old text in place fails acceptance.

### Case C: irreversible erasure request (F02)

An authorized owner requests deletion of the source payload and derived private content. Create a cleanup plan with exact targets, generations, impact, retention/hold check and required approvals. Dry-run lists canonical bytes, backend memories/models, indexes, caches, local agent files/history, exports and backup handling.

An active hold blocks physical purge, not serving revocation. If no blocker remains and the plan is approved, the narrow executor deletes permitted targets idempotently and records per-store receipts. It does not delete newly created versions outside the approved plan.

### Case D: restore and replay (erasure portion: F02)

An old source event arrives after purge. The tombstone prevents reinsertion. A backup is restored into an isolated environment; replay tombstones, reconcile grants and rebuild only eligible projections before allowing reads. Unverified restored content remains unavailable.

### Completion reporting

Report separate milestones: serving blocked; online stores reconciled; local contexts invalidated; physical targets deleted; backup retention/erasure pending or completed. Do not collapse them into "deleted everywhere".

Already delivered customer text cannot be recalled by deleting the platform record. Record that limitation in the operational incident, without disclosing extra private content to the customer.
