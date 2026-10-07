# Lifecycle, Retention and Cleanup

Status: normative. Distinguish immediate serving invalidation from eventual physical deletion.

## Maintenance operations

| Operation | Meaning | Default gate |
|---|---|---|
| Deduplicate | Merge exact redundant records while preserving provenance | Deterministic policy; semantic merges require review |
| Supersede | Mark an approved old version as replaced for current queries | Approved replacement plus effective-time handling |
| Suspend | Stop serving because evidence, authority or access is in doubt | Authorized event/policy; note required |
| Archive | Remove from active search while retaining controlled history | Retention policy |
| Rebuild | Regenerate a derivative from valid permitted inputs | Worker policy and dependency checks |
| Purge | Irreversibly remove target content from covered stores | Approved cleanup plan and retention checks |
| Revoke publication | Immediately deny external reads | Scoped authority; durable barrier before acknowledgement |

## Dependency manifest

Every derived fact/view/skill/publication records complete input object IDs and versions, hashes, audience, source ACL generation, transformation/model/prompt version and output generation. Keep all input dependencies, not only the citations the model chose to show. If precise provenance is unavailable, record the full input set conservatively. Unknown lineage makes a derivative ineligible for serving.

Graph edges support source-to-evidence-to-fact-to-summary/skill/publication traversal. Changes to access can invalidate content without changing its meaning. Changes to evidence may require new reviewed revisions.

## Invalidation protocol

1. Validate the source-change/retraction/revocation event and its scope.
2. In one canonical transaction record the event, suspend affected serving eligibility or raise a project/audience generation barrier, and append outbox work.
3. Serving immediately denies stale generations. For a large dependency fanout, block the entire affected partition until traversal finishes rather than serving a partial stale closure.
4. Workers find descendants, assess surviving evidence, rebuild or withdraw derivatives and reconcile backend memory/index records.
5. Re-enable only derivatives whose dependencies and policy generations were verified. Content changes that affect a reviewed claim require a new revision and approval.
6. Record per-store receipts and retries. Emit completion only when the declared maintenance scope is satisfied.

A source removal does not automatically disprove every dependent fact. Independent valid evidence may survive, but the old dependency manifest cannot silently remain eligible. Keep content suspended while deciding what remains supported.

## Hindsight-specific caution

The documented mental-model staleness flag does not by itself detect deletion [S07](upstream-evidence.md). The adapter must explicitly invalidate affected models and verify rebuild/removal. A refresh that returns successfully is not proof that unsupported text disappeared. If no support remains, withdraw or delete the model rather than trusting an empty refresh.

## Cleanup plan

Required fields: plan ID; scope; operation; exact targets and expected generations; dependency impact; justification note; policy version; retention/hold checks; backup implications; reversible/irreversible classification; required approvers; dry-run findings; execution limits; rollback/compensation plan; completion criteria.

Dry-run is mandatory before irreversible execution. Bind approval to the plan digest and target generations. Any material target change requires a new plan. Agents may propose plans; a narrow executor performs only allowed operations. Never execute model-written arbitrary SQL.

Proposed pilot policy: exact cache expiry and rebuilding invalidated derivatives may run automatically. Purging source content, approved facts, review history or skills requires explicit owner approval and a security/retention check. Cross-tenant cleanup is forbidden.

## Retention and holds

Retention durations are owner decisions, not invented legal rules. Defaults for the synthetic pilot may be short and disposable; real-data pilot requires approved durations. A preservation hold blocks destructive purge but does not force serving revoked information. A hold/purge conflict pauses deletion and routes to the designated owner.

A decline is not an erasure instruction. Keep declined candidates and notes according to policy, outside normal factual retrieval. Sensitive-note redaction uses an audited process and does not silently reverse a review decision.

## Physical deletion scope

Cover source payloads, canonical content, backend memories, observations, mental models, embeddings, search indexes, caches, exports, logs containing content, local agent files, prefetch spill files, session history, evaluation copies and relevant backups. Do not claim completion for stores that were not checked.

Use minimal non-content tombstones to prevent reinsertion by old events or restores. Hashes can themselves be sensitive for low-entropy values; avoid storing unnecessary reconstructable evidence in a tombstone. Replay erasure/revocation tombstones after restore and before reopening reads. Backup removal follows the declared retention mechanism and must have a separate completion/expiry record.

Data already delivered to a user or external provider may not be retractable through this system. Record affected processors/destinations and required actions; do not promise total remote erasure without a verified mechanism.

## Out-of-order events and races

Old source events cannot resurrect purged content or overwrite newer revision state. Cleanup rechecks target generation and hold status at execution time. An approved plan does not authorize deletion of new revisions created after the plan. Retry each target idempotently and report partial completion honestly.

## Recovery

Rollback for suspension is a new authorized revalidation event, not deletion of the audit trail. Irreversible purge has no content rollback; only approved backups under applicable policy can restore permissible content, followed by tombstone reconciliation. A worker crash must not reopen serving eligibility.
