# API and payloads

## Proposed Platform API and MCP Contracts

Status: normative platform v0.1 contract. These routes are **to be implemented**; they are not Hermes, Hindsight or OpenFGA endpoints. Use generated OpenAPI/JSON Schema during implementation.

### Request rules

Authentication and delegation are established outside request bodies. Scope fields narrow authenticated scope; they never grant it. Every mutation requires `Idempotency-Key`. Decisions and destructive commands additionally require an expected resource version plus exact target/content/evidence or plan digests. Server computes digests; clients echo them as preconditions.

Pilot idempotency retention: seven days, configurable. Scope keys by authenticated principal, operation, tenant/project and key. The same key and payload returns the committed result; the same key with different semantic input returns `409 IDEMPOTENCY_CONFLICT`. Do not expire idempotency records while corresponding durable jobs are still retryable.

### Fact and review routes

| Method and route | Purpose | Capability |
|---|---|---|
| `POST /v1/facts` | Create fact and initial draft revision | `propose_fact` |
| `POST /v1/facts/{fact_id}/revisions` | New immutable revision with parent, change note and evidence | `propose_fact` |
| `GET /v1/facts/{fact_id}` | Read eligible current fact, not an unfiltered history dump | `read_fact` |
| `GET /v1/facts/{fact_id}/history` | Explicit permitted revision history | `read_history` |
| `POST /v1/fact-revisions/{revision_id}/review-requests` | Submit approval or clarification request | `request_review` |
| `POST /v1/fact-revisions/{revision_id}/withdraw` | Withdraw open candidate with note/version | Proposer or `manage_review` |
| `GET /v1/review-requests` | List authorized queue with scoped pagination | `read_review` |
| `GET /v1/review-requests/{request_id}` | Exact review packet and permitted evidence | `read_review` |
| `POST /v1/review-requests/{request_id}/notes` | Append scoped comment/amendment | Per-note authorization |
| `POST /v1/review-requests/{request_id}/clarification-responses` | Answer specified questions; does not approve | `respond_clarification` |
| `POST /v1/review-requests/{request_id}/resolve-clarification` | Verify response resolves questions without a content/evidence change | `manage_review` or assigned authorized reviewer |
| `POST /v1/review-requests/{request_id}/decisions` | Approve, decline or request clarification | Target-specific reviewer capability |
| `POST /v1/fact-revisions/{revision_id}/suspend` | Block serving with reason and note | `suspend_content` |

For a pending approval, `request_clarification` resolves that approval request, creates a clarification request and changes fact review state. After all questions resolve, a fresh approval request is required. A clarification response introducing new evidence requires a new revision; the resolve endpoint must return `409 NEW_REVISION_REQUIRED` rather than pretending the old digest is still valid.

Creating a new revision does not silently close existing approved history. An open prior proposal replaced by a new revision is withdrawn through an explicit transactional action with a note. Creation and withdrawal may be an atomic orchestrated command; both events must remain visible.

### Decision body

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
    "body": "The evidence applies only to premium customers. Add that condition and resubmit.",
    "audience": "reviewers_only"
  }
}
```

Digest strings above are placeholders, not valid hashes. Fact `approve` uses `reason_code=verified_against_evidence`; `request_clarification` includes reason `ambiguous_scope` or another declared reason plus `questions`. The server derives actor, note type and timestamps. Arbitrary reason strings are rejected; extend the schema intentionally.

A successful response includes decision ID, target revision, resulting status, new request version, audit event ID and any new clarification request ID. The decision is committed synchronously; projection readiness is reported separately, not implied.

### Query and publication routes

| Route | Behavior |
|---|---|
| `POST /v1/query` | Internal current/history/review queries with explicit mode and validated scope; see answer contract |
| `POST /v1/publications` | Propose immutable sanitized content tied to exact eligible dependencies |
| `POST /v1/publications/{publication_id}/review-requests` | Submit publication approval; use generic decisions route with publication capability |
| `POST /v1/publications/{publication_id}/grants` | Grant exact approved publication version to explicit principal/group |
| `GET /v1/publications/{publication_id}` | Read exact granted publication; no internal lineage or notes |
| `POST /v1/publications/{publication_id}/revoke` | Commit a denial barrier and schedule propagation |
| `POST /v1/guest/query` | Search only authorized publication versions; never general memory banks |
| `POST /v1/cleanup-plans` | Propose a bounded dry-run plan |
| `POST /v1/cleanup-plans/{plan_id}/review-requests` | Request required approval of exact plan digest |
| `POST /v1/cleanup-plans/{plan_id}/execute` | Execute approved, generation-matching plan with narrow service authority |
| `GET /v1/jobs/{job_id}` | Read scoped asynchronous operation state |

Review requests are discriminated by `target_type`; the server checks it against the stored request before applying target-specific schemas. Every decision has `target_type`, `target_id`, `digest_codec`, expected request version, policy version, action, reason code and note.

| Target | Additional digest preconditions | First-milestone decisions | Capability |
|---|---|---|---|
| `fact_revision` | `expected_content_digest`, `expected_evidence_digest` | approve, decline, request_clarification | `approve_fact` |
| `publication` | `expected_content_digest`, `expected_evidence_digest` (exact dependencies and release basis) | approve, decline | `approve_publication` |
| `skill_revision` | Schema is specified when F01 is selected | Disabled | `approve_skill` alone does not enable feature |
| `cleanup_plan` | Schema is specified when F02 is selected | Disabled | `approve_cleanup` alone does not enable feature |

Reject unknown or cross-target fields. Publication content digest covers content, audience and sanitized citations; evidence digest covers exact dependency IDs/digests and release basis. The [digest contract](facts.md#digest-contract) owns encoding. Future skill/cleanup routes and MCP proposals remain unavailable in M1; they are design references, not an implemented generic reviewer.

Implement a typed request/response/error schema for each enabled route with its owning task, including required fields, extra-field rejection, pagination and idempotency scope. Only enabled, contract-tested routes appear in generated OpenAPI/MCP discovery. Do not advertise future routes with successful placeholder responses.

### Error taxonomy

| HTTP/code | Meaning |
|---|---|
| `400 INVALID_SCOPE` | Requested scope is empty/malformed, without revealing hidden data |
| `401 UNAUTHENTICATED` | Missing or invalid identity |
| `403 FORBIDDEN` | Visible object, forbidden action |
| `404 NOT_FOUND` | Unknown or not-visible object; identical external shape |
| `409 REVISION_CONFLICT` | Stale decision/resource version or digest |
| `409 INVALID_TRANSITION` | Current state does not allow the action |
| `409 NEW_REVISION_REQUIRED` | Response changes reviewed semantics/evidence |
| `409 IDEMPOTENCY_CONFLICT` | Key reused with different command |
| `422 NOTE_REQUIRED` | Missing, blank or invalid reason note |
| `422 UNRESOLVED_CLARIFICATION` | Attempt to submit/approve with blocking questions |
| `422 INCOMPLETE_EVIDENCE` | Required evidence or attestations missing |
| `503 POLICY_UNAVAILABLE` | Cannot safely authorize |
| `503 ELIGIBILITY_UNAVAILABLE` | Cannot establish current validity |

For malformed schemas use `422 VALIDATION_ERROR`. Error responses include a safe request ID and retryability, not raw policy data or hidden object metadata.

### MCP tools

Proposed tools: `memory.query`, `memory.propose_fact`, `memory.request_clarification`, `memory.get_review_status`, `memory.add_note`, `memory.propose_skill`, `memory.propose_cleanup`. Implement them as thin wrappers over the gateway with identical policies and idempotency.

Do not expose human approval, grant administration, arbitrary SQL, direct Hindsight banks or OpenFGA administrative tools to ordinary agents. A human review UI uses authenticated review APIs. An explicitly authorized operational worker uses a separate tool set and identity; user prompts cannot promote it.

### Request validation and retry order

Authenticate, validate non-empty narrowed scope, and establish object visibility before returning object-specific errors. Validate the target discriminator and schema, then compute the semantic command digest. An existing idempotency key with a different command returns `IDEMPOTENCY_CONFLICT`; an identical committed command may return its receipt only while current visibility permits it. An old receipt is historical metadata, not proof of present read/approval authority. Never replay hidden note text after access is revoked.

For a new command, validate version/digest/codec and policy preconditions, current request lifecycle, action authority, required reason note and transition-specific guards; commit atomically under the authority-generation protocol. An expired request uses `INVALID_TRANSITION`; a current request with a stale digest/version/policy uses `REVISION_CONFLICT`. Malformed schema/unknown target-specific reason codes use `VALIDATION_ERROR`. Disabled skill/cleanup routes return the same non-revealing `NOT_FOUND` shape as unavailable routes.

The first-milestone reason-code sets are: fact approval `verified_against_evidence`; fact decline the codes in the fact-review contract; clarification `ambiguous_scope`, `insufficient_evidence`, `contradictory_evidence`, `other`; publication approval `verified_for_audience`; publication decline `invalid_release_basis`, `sensitive_content`, `ineligible_dependency`, `other`; withdrawal `replaced`, `cancelled`, `other`; suspension/revocation `source_retracted`, `source_restricted`, `material_conflict`, `access_revoked`, `other`. Request lifecycle reasons are `request_expired`, `policy_changed`, `reassigned`, `cancelled`, `other`. Extension requires a schema change and regression fixture. A non-empty note is required even for `other`.

## API Payload Examples

All IDs, timestamps and digest strings are synthetic. Requests illustrate the [proposed platform API](api.md#proposed-platform-api-and-mcp-contracts). Authentication, effective actor and idempotency headers are external to these bodies. Placeholder digests must be replaced by server-returned values in real calls.

### Candidate claim payload

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

### Clarification request

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

### Approval

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

### Decline

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

### Customer publication proposal

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

### Safe blocked response

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
