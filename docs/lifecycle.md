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

Restore into an isolated environment using a matched control-ledger backup and content manifest. Back up the database snapshot plus every immutable file referenced at that snapshot, preserving hashes; application writes may continue only if this inclusion guarantee holds. Reconcile missing/corrupt files, replay revocation and erasure tombstones, reconcile grants and projections, verify hold/retention conditions, and run security scenarios before permitting user traffic. Never rebuild approvals or grants from Markdown frontmatter. Search/Hindsight projections may be rebuilt after these checks.

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

## Docker deployment

Package the web console, gateway and workers with pinned builds and a Docker Compose deployment for PostgreSQL, policy service and the required Hindsight/Hermes integrations. Persist the private Markdown content root separately from the PostgreSQL control-ledger volume and vendor stores. Separate runtime credentials and data volumes along existing capability boundaries; do not combine vendor databases with canonical migrations. Containers run without root where upstream permits; exceptions require a documented reason and constrained capabilities.

Expose only the web/gateway entrypoint. Bind local development to loopback by default; shared deployments require TLS and real identity configuration. Keep database, policy administration and memory-engine ports internal. Inject secrets at runtime, never through image layers or committed Compose defaults. The console must not receive the Docker socket or host command execution.

Run migrations as an explicit one-shot operation with failure preventing readiness. Distinguish liveness from readiness: process health is not policy availability or projection catch-up. Restart must retain canonical data, grants, revocation barriers and durable jobs. Shutdown stops intake and bounds in-flight work; recovery preserves idempotency. Verify backup/restore against the existing revocation barrier scenario. Publish actual build/start/upgrade/backup commands with the implementation, tested from a clean checkout; do not present proposed commands as working setup instructions.

## Core-owned memory maintenance

TruthBase owns the memory lifecycle. Implement capture, extraction, retrieval orchestration, scheduled consolidation proposals and evaluation as application capabilities in `packages/core`; LLM/Hindsight/GitHub adapters live in `packages/adapters`, and `apps/worker` runs durable jobs. Hermes, Codex and OpenCode submit scoped observations through the same contracts. No scheduler or accepted memory state depends on a live Hermes session, its local memory files or its cron daemon.

An LLM connection supplies inference, not persistent memory, scheduling, authority or evidence. Use approved routes by purpose (`extraction`, `answering`, `maintenance`, `evaluation`, `embedding`), with model/prompt versions, context limits, timeouts and project budgets. Track input/output tokens and estimated/actual cost when available; unavailable cost is unknown, never zero. A fallback provider must have the same approved egress scope. Durable receipts link outputs to exact input revisions and record unsupported provider behavior.

### Capture and daily cycle

Captured conversations retain speaker/source attribution and minimum required evidence; agents submit observations, not raw global session history. User corrections are input to review, not automatic business-rule approval. Daily maintenance operates on authorized changes since a successful checkpoint plus bounded stale/conflict candidates, never the whole tenant corpus by default. The [deliberate intake contract](facts.md#deliberate-intake) bounds sources, proposals and review capacity; unattended runs cannot expand scope or scan to increase fact counts.

1. Select an immutable input manifest for one project and effective audience. Recheck source eligibility and destination approval before model calls; review-only evidence stays in the learning workspace.
2. Run deterministic integrity, duplicate and stale-reference checks first. Skip model calls for unchanged inputs. Budget any semantic consolidation, contradiction detection and missing-evidence analysis.
3. Produce candidate revisions and clarification/conflict items, each with a concise rationale, exact lineage and diff. In M1, record procedure-improvement opportunities as findings for F01 rather than enabled skill revisions. Repetition across derived summaries is not corroboration. Existing fact/publication bytes remain immutable.
4. Validate output schemas and evidence links; run relevant regression/evaluation gates. Required human review still decides new semantic content. Procedure evaluation/activation remains F01; M1 records knowledge proposals and verified correction evidence only.
5. Commit proposals and durable job receipts idempotently, then advance the checkpoint. Index updates follow normal approved-revision events. Record no-op, partial, budget-stopped, failed and completed outcomes distinctly. Every admitted change retains the [mutation provenance](facts.md#provenance-for-every-mutation); job completion is not evidence that its generated claims are true.

A recurring schedule stores explicit timezone/local time, policy version and limits; daily frequency is supported but disabled until configured by an authorized operator. Resolve each slot to UTC with a documented DST policy. Uniqueness on project/schedule version/slot plus a database lease with fencing prevents duplicate execution across workers. Checkpoint only completed work; retries reuse proposal identities and do not launch another paid inference after a persisted result. An indeterminate provider response may consume cost again: cap retries and report uncertainty, never promise exactly-once billing. Catch-up after downtime is bounded, not one unbounded run per missed day.

Cancellation, connection disable or authority revocation fences work before the next call and before proposal commit. An output based on a superseded input manifest cannot silently overwrite newer work. No run can approve, publish, grant, change policy, install tools, delete originals or activate its own skills. Automatically repairing a rebuildable index is allowed only through existing deterministic reconciliation; changing knowledge remains a proposal.

### Measuring improvement

Compare baseline and proposed behavior on versioned, scoped cases and verified outcomes. Track unsupported claims, correction recurrence, stale retrieval, useful accepted proposals, latency and model cost; more notes or accepted proposals alone do not establish improvement. Keep evaluator provenance separate from proposing output and use independent adjudication for semantic acceptance. Reuse existing safety tests; add tests only for scheduler/retry, changed-input and proposal-admission boundaries. F01 later supplies approved, versioned procedures to any client through the platform, with rollback and revocation; it never rewrites a client's global system instructions automatically.

## Private GitHub content backup

Provide a separate `github_backup` connection purpose with an explicit project, repository ID, branch, permitted content classes and write credential. GitHub source-read credentials do not automatically authorize backup writes. The destination must be a private repository approved for every exported object; never use the public TruthBase source repository. Repository collaborators can read its entire Git history, so a backup audience must cover every included object or the destination must be separated by audience. Repository privacy is not a replacement for export authorization.

A backup run selects a control-ledger snapshot manifest and copies only registered, integrity-verified Markdown revisions explicitly included by policy, plus permitted attachments if within configured size limits. By default include only eligible approved fact/publication payloads; raw sources, review notes, candidates, credentials, logs, sessions and provider keys are excluded. Adding a class requires an explicit policy update. The manifest records exact revision IDs, hashes, scope, policy version and snapshot ID, including exclusions so partial coverage is visible. It contains no secret values.

Prepare the snapshot in an isolated worker checkout with hooks disabled and a trusted Git configuration. Resolve and verify the configured remote repository identity/privacy and branch before every push; check export authority again at the external handoff. Serialize pushes per destination and compare expected remote head. A conflict stops for reconciliation; no force-push or automatic import of remote edits. Retries reuse snapshot identity and verify remote reachability of the exact commit before marking success. A network timeout is unknown until verified, not proof of backup. Do not block an interactive review on remote availability.

Git is a content backup, not complete disaster recovery. Track content coverage/last verified commit separately from the matched encrypted control-ledger backup required by the existing restore contract. Restoring Git alone imports content as unapproved/ungranted; it cannot restore review authority or erase revocation barriers. Restoring a full matched backup remains an isolated, verified operator procedure. Remote edits are imported through candidate review, never trusted as control state.

Revocation blocks TruthBase serving and future exports at the existing release boundary; it cannot recall prior Git clones or historical commits. Record remote snapshot locations for retention/erasure work. History rewriting/destructive backup cleanup remains F02 and must not be reported complete by deleting a file in the latest commit. Network retries never override a newly revoked export permission. Enabling this feature does not authorize creating a real destination repository or exporting user data during implementation.

## Budget enforcement

Use the control ledger for project, provider/connection and run/request limits. Support daily/monthly currency ceilings plus token/request/concurrency limits and notification thresholds. Each policy declares currency, calendar/timezone, version and delegated management ceiling; use integer minor/micro-units or exact decimal arithmetic, never binary-float currency accumulation. Disabled/unset budgets do not mean unlimited autonomous scanning: an inference route requires explicit limits.

Before every potentially billable dispatch, calculate a conservative reservation from the validated input, bounded output/reasoning settings and versioned provider price rules (including cache or other billable categories where applicable). Atomically reserve across all applicable budgets with a stable attempt ID; concurrent requests cannot independently spend the same remainder. If no trustworthy bound can be calculated, block budget-controlled dispatch until a supported policy/pricing entry is configured. Provider prices are configured/versioned with evidence and review date, not copied as timeless constants into code.

Settle reservations once using reported usage and the applicable pricing version; distinguish estimates, provider-reported usage, confirmed charges and unresolved discrepancies. Retries/fallbacks are separate potentially billable attempts charged to the same originating run and project. Prevent retries multiplying across SDK and worker layers. A timeout, cancellation or worker crash does not prove zero provider charge; retain an uncertain reservation until reconciled or conservatively settled by an audited policy. A budget-period rollover cannot release unresolved prior attempts or double-count their settlement.

At a hard local limit, reject new calls and pause affected jobs; lower-priority dreaming cannot borrow another project's allocation. Rate-limit failures use bounded backoff without bypassing reservations. Operator edits to limits are versioned/audited and bounded by delegated authority; agents cannot raise budgets. Local admission bounds estimated spend under the configured price model, not the provider's final invoice: pricing drift and indeterminate remote work must be visible. No infinite retries to reconcile unknown billing.
