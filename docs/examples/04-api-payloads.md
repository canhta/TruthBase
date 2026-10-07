# API Payload Examples

All IDs, timestamps and digest strings are synthetic. Requests illustrate the [proposed platform API](../specs/api-and-mcp-contracts.md). Authentication, effective actor and idempotency headers are external to these bodies. Placeholder digests must be replaced by server-returned values in real calls.

## Candidate claim payload

For `POST /v1/facts`, the server creates the IDs and initial draft state. Caller scope must already be authorized.

```json
{
  "project_id": "PRJ-atlas",
  "claim": {
    "statement": "Premium customers may request refunds within 30 days, excluding consumed credits.",
    "subject": "premium_customer",
    "predicate": "refund_request_window_days",
    "object": 30,
    "conditions": ["customer_plan=premium"],
    "exceptions": ["consumed_credits_excluded"],
    "kind": "business_rule",
    "semantic_layer": "L2",
    "epistemic_type": "approved_intent",
    "valid_from": "2026-10-01T00:00:00Z",
    "valid_to": null,
    "evidence_ids": ["EV-email-1"],
    "classification": "internal",
    "authority_basis": {"type": "business_owner_decision", "evidence_id": "EV-email-1"},
    "uncertainty": {"reason_codes": [], "explanation": "", "missing_evidence": [], "questions": []}
  },
  "submission_note": "Extracted from the scoped business-owner decision; requires human review."
}
```

`approved_intent` describes the claim's asserted basis; it does not set `review_status=approved`. The server still creates a draft.

## Clarification request

For `POST /v1/fact-revisions/FR-refund-001/review-requests`:

```json
{
  "request_kind": "clarification",
  "expected_fact_version": 1,
  "reason_code": "ambiguous_scope",
  "note": {"body": "The ticket does not establish plan scope or exclusions.", "audience": "reviewers_only"},
  "questions": [
    {
      "question_id": "Q-tier",
      "question": "Which plan tiers are covered, and are consumed credits excluded?",
      "why_blocking": "Both conditions change customer eligibility.",
      "expected_response_type": "scope_and_evidence",
      "proposed_owner_group": "atlas-business-approvers"
    }
  ]
}
```

The server validates the owner group; a client-proposed group is not an authority grant.

## Approval

For `POST /v1/review-requests/RQ-approve-003/decisions`:

```json
{
  "action": "approve",
  "target_type": "fact_revision",
  "target_id": "FR-refund-003",
  "digest_codec": "gm-json-v1",
  "expected_request_version": 2,
  "expected_content_digest": "sha256:example-content-digest",
  "expected_evidence_digest": "sha256:example-evidence-digest",
  "review_policy_version": "review-policy-v1",
  "reason_code": "verified_against_evidence",
  "note": {
    "body": "Verified premium scope, 30-day window, consumed-credit exclusion and October 1 effective date. Deployment is not part of this approval.",
    "audience": "reviewers_only"
  }
}
```

## Decline

```json
{
  "action": "decline",
  "target_type": "fact_revision",
  "target_id": "FR-refund-002",
  "digest_codec": "gm-json-v1",
  "expected_request_version": 3,
  "expected_content_digest": "sha256:example-content-digest",
  "expected_evidence_digest": "sha256:example-evidence-digest",
  "review_policy_version": "review-policy-v1",
  "reason_code": "missing_exception",
  "note": {
    "body": "The proposed rule omits the consumed-credit exclusion. Add it and submit a new revision.",
    "audience": "reviewers_only"
  }
}
```

## Customer publication proposal

```json
{
  "project_id": "PRJ-atlas",
  "content": "For premium plans, refund requests can be made within 30 days. Consumed credits are excluded.",
  "dependency_revision_ids": ["FR-refund-003"],
  "intended_audience": {"type": "customer_group", "id": "CUSTOMER-GROUP-A"},
  "sanitized_citations": [{"label": "Approved refund policy", "public_reference": "refund-policy-october"}],
  "submission_note": "Share only the approved customer rule; exclude internal implementation status and reviewer notes."
}
```

This creates a draft publication, not a grant. A separate authorized approval and grant activation are required.

## Safe blocked response

```json
{
  "answer_id": "ANS-demo-002",
  "mode": "current",
  "status": "insufficient_evidence",
  "answer": "I do not have an approved fact available that establishes deployment of this change.",
  "claims": [],
  "citations": [],
  "warnings": ["deployment_not_verified"]
}
```

A reviewer may receive an authorized request link through review APIs. The ordinary response does not reveal a hidden pending fact or its notes.
