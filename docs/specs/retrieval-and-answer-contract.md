# Retrieval and Answer Contract

Status: normative serving pipeline. Related: [authorization](authorization-and-publication.md), [Hindsight adapter](hindsight-adapter.md).

## Retrieval modes

| Mode | Audience | Eligible content |
|---|---|---|
| `current` | Authorized internal users | Current approved facts and valid scoped derivatives |
| `history` | Users with explicit history permission | Time-qualified approved historical revisions, subject to current restrictions |
| `review` | Authorized reviewers only | Candidates, notes and evidence in assigned review context, clearly labeled |
| `publication` | Guests and permitted internal viewers | Exact granted publication versions only |

Never blend review candidates into current answers. A reviewer can examine a declined proposal without causing it to enter general memory context. Guests cannot select `review` or `history` to bypass publication-only access.

## Mode-specific eligibility

| Mode | Required predicate | Content boundary |
|---|---|---|
| `current` | Approved dependency validity + current effective selection + caller/delegation read access + current generations | Approved facts and permitted derivatives only |
| `history` | Approved historical revision + requested valid/recorded time + history access + current evidence/access/tombstone checks | Superseded/archived content only where retention permits; never suspended, purge-pending or purged content |
| `review` | Assigned/scoped review access + target/note/evidence audience checks + current access/tombstone checks | Draft, unclear, pending, declined, withdrawn and approved revisions may be inspected with their exact status; review content never enters serving projections |
| `publication` | Approved publication + active exact-version grant + current dependencies + valid release basis + current generations | Only the immutable sanitized publication payload and approved public citations |

A guest's inability to read an internal dependency is not itself publication invalidity. The release basis authorizes the narrower published content; it does not grant raw-source access. Internal dependency IDs stay internal. Publications stop serving on dependency supersession as specified in [publication](authorization-and-publication.md#publication-eligibility).

Review responses identify the exact revision/status and authorized notes; they do not label candidate assertions as approved facts. History selection reconstructs recorded state at the requested time but always overlays present access/retraction/erasure barriers. Unknown modes fail schema validation.

## Serving sequence

1. Authenticate user, agent and delegation. Validate non-empty tenant/project scope.
2. Resolve action/layer/object permissions and capture current policy/eligibility generations.
3. Retrieve IDs and permitted candidate content from canonical storage or a certified audience-sealed backend partition. Apply permissions before any unauthorized content reaches a model.
4. Resolve results to exact canonical objects and apply the selected mode predicate above. Unapproved content is permitted only inside an authorized review response. Future-effective content is excluded from current mode; history uses the explicitly requested time.
5. Build a minimal context bundle with allowed facts, explicit uncertainty, safe citations and observation timestamps.
6. Generate a structured response using only that bundle, or return a deterministic fact/publication response.
7. Validate claim support and citations; recheck generation and authorization before emitting. On change, discard and rebuild or fail safely.
8. Record an access-controlled answer receipt with IDs, versions, model/prompt versions and policy decision references, not unrestricted copies of source text.

No raw backend trace, graph neighbor expansion or model-produced citation is trusted. Unresolvable citations fail validation. Do not cite a document title or locator the user cannot read.

## Response shape

```json
{
  "answer_id": "ANS-demo-001",
  "mode": "current",
  "status": "answered",
  "answer": "The approved premium-plan refund window is 30 days. Deployment is not yet established by the available evidence.",
  "claims": [
    {
      "text": "The approved premium-plan refund window is 30 days.",
      "fact_revision_ids": ["FR-refund-003"],
      "epistemic_type": "approved_intent"
    }
  ],
  "citations": [{"label": "Approved refund rule", "resource_id": "FR-refund-003"}],
  "as_of_valid_time": "2026-10-07T02:00:00Z",
  "warnings": ["deployment_not_verified"]
}
```

This is an illustrative platform response, not an upstream API. `status` is `answered`, `insufficient_evidence`, `needs_clarification`, or `temporarily_unavailable`. Hidden resource IDs, review requests and unsupported detail are omitted for unauthorized users.

## Unknown or unapproved information

Say what cannot be established without implying hidden content exists. Example: "I do not have an approved fact available for that question." An authorized internal user may receive a link to an existing clarification request. Opening a new request is a separate authorized action, not a silent side effect of every search.

Where partial answers are safe, provide supported facts and explicitly bound the unknown. Do not infer deployment from Done status, ownership from a mention, approval from a comment or truth from a model-generated summary.

## Progress and aggregate views

Compute numerical metrics from versioned structured facts and explicit formulas. Store denominator, source coverage, observation time and freshness deadline. Summarization explains calculations; it does not fabricate percentages or missing statuses.

Aggregates can reveal excluded data. Build them from the viewer's allowed inputs or from a separately approved sanitized publication. Do not show hidden-project counts or "three blocked items you cannot access".

## Context budget and caching

Load task-relevant rules and their necessary exceptions, not every remembered fact. Preserve qualifications before aggressively shortening context. Use token budgets as configurable limits and measure answer quality when reducing them.

Invalidate query results, prefetch bundles, derived summaries, response caches and persistent conversation context on relevant permission or evidence changes. Disable sensitive response streaming in the pilot. A final checker cannot undo a disallowed sentence already streamed.

## Backend fallback

If Hindsight is unavailable, use authorized canonical full-text retrieval and return a bounded answer. If authorization or canonical eligibility is unavailable, do not fall back to an old memory dump. If lineage cannot be verified, exclude that result. Safe failure is preferred to a confident unsupported answer.
