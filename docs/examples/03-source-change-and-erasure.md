# Worked Example - Source Update, Retraction and Erasure

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

## Case A: an ordinary proposed change

A new ticket proposes a 60-day window. Create a new candidate, not a silent replacement. FR-003 remains current if its evidence/authority remains valid and the proposal is not a material contradiction. The new claim requires its own review. An authorized review workspace may show the change request, labeled as proposed. It does not enter current factual answer context.

## Case B: authoritative retraction

The business owner retracts the email decision. Validate authority and commit a source-retraction event plus an eligibility barrier. Block FR-003-dependent serving paths, including PUB-001, before asynchronous cleanup. Preserve historical decisions, but historical access cannot bypass the current restriction.

The dependency worker inspects all listed descendants, not just the visible citation list. If some independent eligible evidence supports a claim, create/approve a corrected revision where needed. If support is gone, withdraw the corresponding summary/publication and suspend the skill. A successful backend refresh that leaves old text in place fails acceptance.

## Case C: irreversible erasure request (F02)

An authorized owner requests deletion of the source payload and derived private content. Create a cleanup plan with exact targets, generations, impact, retention/hold check and required approvals. Dry-run lists canonical bytes, backend memories/models, indexes, caches, local agent files/history, exports and backup handling.

An active hold blocks physical purge, not serving revocation. If no blocker remains and the plan is approved, the narrow executor deletes permitted targets idempotently and records per-store receipts. It does not delete newly created versions outside the approved plan.

## Case D: restore and replay (erasure portion: F02)

An old source event arrives after purge. The tombstone prevents reinsertion. A backup is restored into an isolated environment; replay tombstones, reconcile grants and rebuild only eligible projections before allowing reads. Unverified restored content remains unavailable.

## Completion reporting

Report separate milestones: serving blocked; online stores reconciled; local contexts invalidated; physical targets deleted; backup retention/erasure pending or completed. Do not collapse them into "deleted everywhere".

Already delivered customer text cannot be recalled by deleting the platform record. Record that limitation in the operational incident, without disclosing extra private content to the customer.
