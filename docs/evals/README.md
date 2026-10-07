# Evaluation and Acceptance

Status: proposed acceptance contract. Targets are product targets, not measured performance or upstream benchmark claims.

## Test selection

[Engineering rules](../agents/engineering.md#mindful-tests) define risk-based test selection. Each case below must add evidence for a meaningful failure mode. Reuse fixtures and existing scenario tests across tasks; do not create a unit/integration/end-to-end copy of every assertion. The [scenario catalog](scenarios.md#ownership-and-evidence) assigns owners and distinguishes deferred slices.

## Evaluation layers

| Layer | Method | Main purpose |
|---|---|---|
| Unit | Deterministic state-machine, eligibility, note and digest tests | Prevent illegal transitions and invalid acceptance |
| Integration | Real database, policy model, queue and adapter tests | Prove boundaries through actual storage and APIs |
| Acceptance | Scenario fixtures in [SCENARIOS](scenarios.md) | Cover complete user workflows and regressions |
| Semantic | Adjudicated business questions and evidence entailment | Measure correct conditions, exceptions and temporal reasoning |
| Adversarial | Unauthorized users, poisoned sources and races | Demonstrate fail-closed behavior |
| Operational | Retry, crash, lag, restore and cleanup drills | Establish recoverability and honest completion semantics |

## Hard release gates

All first-milestone approval, authorization, invalidation, revocation, retry and adapter scenarios must pass at their owning boundary. E32 must prove disabled destructive execution is denied. E33-E34/E38-E39/E46.erasure remain deferred until F01/F02 and cannot be counted as passing M1 coverage. No unauthorized bytes may appear in captured customer model input or output during the test suite. No pending, declined or withdrawn candidate may appear as approved truth. Every state-changing human review has its required note and exact-version binding.

Zero observed leaks in a finite suite is a release criterion, not proof that no vulnerability exists. Report scope and coverage rather than claiming perfect security.

## Integration completion

M1 requires actual pinned Hindsight projection/scoped recall and an actual pinned Hermes provider using the gateway. Canonical fallback, fake provider callbacks or mock policy decisions cannot satisfy those integration gates. Disabled reflection/mental-model synthesis is acceptable if the required Hindsight path succeeds safely. Record `blocked` for a missing required capability.

## Proposed pilot quality targets

Choose an adjudicated fixture set by distinct failure modes: qualifier loss, scope leakage, approval confusion, temporal replacement, unsupported deployment and unanswerable questions. Record why each case is needed and reuse it across implementations; there is no question-count quota. Freeze expected claims, citations and unknowns before evaluating.

Suggested quality targets are >=95% atomic-claim correctness and >=95% citation support on that declared set; all deliberately unanswerable cases must avoid unsupported factual claims. Report counts by category and small-sample limits. These percentages do not establish population-level accuracy or replace the hard safety gates.

Do not blend semantic answer scores with hard safety failures into one reassuring average. One forbidden disclosure or silent self-approval fails the release gate regardless of average answer quality.

## Freshness and performance

Suggested initial targets on the declared pilot environment: 95% of permitted source updates produce a candidate within five minutes; 95% of approved revisions reach a ready serving projection within two minutes; query response p95 below five seconds excluding explicitly reported upstream outages. Measure against a documented dataset and hardware profile before accepting or changing targets.

Revocation is a correctness boundary, not merely a latency percentile: after durable revocation acknowledgement, new responses must not release the revoked content. Test in-flight generation and prefetched context. Physical deletion has separate per-store completion targets and receipts.

## Review and learning metrics

Measure clarification frequency by reason, pending age, approve/decline rates by candidate category, corrected-with-new-revision rate, duplicate decline suppression and note completeness. These metrics diagnose workflow quality; they are not personal performance rankings.

For learning, compare baseline/proposed skill on the same fixtures, model configuration and tool permissions. Record safety regressions, task success, unsupported-claim rate, token cost and latency. Human adjudicate ambiguous cases. Never let an evaluator with privileged evidence pass a response that leaked it to a narrower audience.

## Required evidence bundle

For each test: scenario ID, seed fixture version, dependency pins, test command, timestamp, observed state/events, authorized context capture or redacted receipt, expected/actual result and failure artifacts. Use synthetic data in shareable reports.

Record `not_run`, `passed`, `failed` or `blocked`; never substitute "should pass". The documentation package includes scenario specifications only. The implementation must convert them into executable tests.

## Synthetic dataset

Use two tenants, at least two projects, explicit principals and one exact-version customer grant. Cover valid, pending, declined, future-effective, superseded and suspended records; add erased-record fixtures only when F02 is enabled. Include source changes, quoted evidence, code revisions and missing deployment evidence. Each semantic case must justify a distinct failure mode; production-derived fixtures require separate authorization and retention.

## Case schema

```json
{
  "case_id": "SEM-refund-001",
  "dataset_version": "synthetic-v1",
  "principal_id": "USR-po-atlas",
  "scope": {"tenant_id": "TEN-demo", "project_id": "PRJ-atlas"},
  "mode": "current",
  "question": "What refund rule is approved, and is it deployed?",
  "expected_claims": ["premium_only", "30_days", "consumed_credits_excluded"],
  "expected_unknowns": ["deployment_status"],
  "allowed_revision_ids": ["FR-refund-003"],
  "forbidden_content_markers": ["INTERNAL-NOTE-CANARY", "OTHER-PROJECT-CANARY"],
  "required_citation_ids": ["FR-refund-003"],
  "as_of_valid_time": "2026-10-07T02:00:00Z"
}
```

Canaries are synthetic detection aids, not a complete leakage oracle. Add structural access checks and human inspection of captured context; not every sensitive disclosure will contain a canary.

## Scorecard

| Metric | Definition | Required reporting |
|---|---|---|
| Atomic correctness | Correct required atomic claims / evaluated required claims | Count and percentage by category |
| Citation support | Answer claims actually supported by allowed cited evidence / cited factual claims | Count, percentage and adjudication disagreements |
| Unsupported claim rate | Unsupported factual claims / all factual claims | Include severity and examples |
| Unknown handling | Unanswerable cases without invented certainty / unanswerable cases | Count and failure examples |
| Access violations | Forbidden content in context/output or forbidden object/action allowed | Absolute count; any failure blocks release |
| Review integrity | Required state/note/concurrency scenarios passed | Pass/fail/blocked/not-run per scenario |
| Update freshness | Event-to-candidate and approval-to-projection delay | p50/p95, sample size and environment |
| Cost/latency | Tokens/provider cost/query and end-to-end latency | Model/version, hardware, period and exclusions |
| Cleanup completeness | Required store receipts satisfied / declared targets | Separate serving block from physical removal |
