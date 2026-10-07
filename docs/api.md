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

## Console and connection API

These proposed management routes use the request rules above. Tenant/project scope is explicit and validated against the authenticated principal. Mutations require `expected_version` where the resource exists. Secrets are accepted only over a protected authenticated channel; never embed them in URLs.

| Route | Contract |
|---|---|
| `GET /v1/access` | Scoped principals, capabilities and grants; requires `manage_access` |
| `POST /v1/access/changes` | Explicit grant/revoke with subject, target, capability, reason and expected authority generation; enforce delegated ceiling |
| `GET /v1/connections` | Sanitized configuration and versioned test diagnostics; `manage_connections` |
| `POST /v1/connections` | Create disabled typed configuration; optional write-only credential |
| `PATCH /v1/connections/{connection_id}` | Replace validated non-secret settings; invalidate old test result |
| `POST /v1/connections/{connection_id}/credentials` | Rotate write-only credential and fence old generation |
| `POST /v1/connections/{connection_id}/test` | Bounded explicit probe returning scoped job ID; no synchronization |
| `POST /v1/connections/{connection_id}/enable` | Enable current tested and authorized configuration |
| `POST /v1/connections/{connection_id}/disable` | Fence use of configuration before acknowledgement |
| `POST /v1/agent-credentials` | Issue scoped, expiring agent credential; return secret once; `manage_agent_credentials` |
| `POST /v1/agent-credentials/{credential_id}/revoke` | Invalidate session authority and stop later releases |

Configuration shapes are owned by [connection configuration](integrations.md#connection-configuration). Provider diagnostics must be sanitized before persistence and response. Connection mutation/probe routes require `manage_connections`; possession of a connection ID conveys no authority. Agent credential list/detail APIs expose metadata only. Cookie-based browser sessions require CSRF protection and restricted origins.

## Independent MCP clients

Expose the existing governed MCP tool contract through an authenticated gateway transport usable independently of Hermes. Start with Streamable HTTP; pin the protocol/SDK and verify transport/auth compatibility with actual pinned Codex and OpenCode versions in the implementation issue. Provide tested client configuration examples at that point, never guessed flags or a claim based only on an SDK client.

Map authenticated credentials to a principal and permitted scope on the server. A caller-supplied tenant/project only narrows that scope. Reuse HTTP application services, errors, idempotency, eligibility and final-release checks. Do not expose provider keys, connection administration, access administration, approval, publication grants, shell execution or destructive cleanup as agent tools. Existing proposal/review-read tools remain capability scoped. Cross-session context isolation and revoked credentials must be tested through both real clients. Test doubles can validate mapping but cannot satisfy interoperability acceptance.

## Memory maintenance controls

Proposed operator routes use existing scoped authentication, idempotency and expected-version rules. `manage_memory_jobs` manages schedules and bounded runs but conveys no additional source-read, model-egress, approval or backup-export rights; execution intersects all of them. `manage_backups` manages snapshot configuration/jobs within the same export limits. Credentials remain in the connection boundary.

| Route | Contract |
|---|---|
| `POST /v1/observations` | `propose_fact` submits attributed evidence/verified-outcome claims as untrusted learning input; returns durable receipt and candidate/job reference, never approval |
| `PUT /v1/memory-schedule` | Configure or disable project-local schedule, timezone, route, budget and policy under `manage_memory_jobs` |
| `POST /v1/memory-runs` | Start a bounded scoped maintenance run with optional dry-run; dry-run reports selection without model calls or proposal writes |
| `POST /v1/memory-runs/{run_id}/cancel` | Fence future work; preserve already committed receipts and incurred-cost evidence |
| `POST /v1/backup-runs` | Start a policy-scoped content snapshot using an enabled `github_backup` connection; `manage_backups` |
| `POST /v1/backup-runs/{run_id}/cancel` | Fence subsequent export; already handed-off bytes follow the existing boundary |

Read run status through `GET /v1/jobs/{job_id}` with existing scope/visibility rules. Observation payloads identify speaker kind, source references, captured scope/time and outcome verification references; the server supplies submitter identity and validates authority. Missing verification remains unverified. The Markdown content/commit protocol applies to durable text. Do not expose schedules, backup exports or maintenance controls as ordinary agent MCP tools; approved observation submission maps to the existing proposal path. File imports and observations never accept caller-supplied approval/grant state.

## Graph and Markdown views

`GET /v1/graph` accepts narrowed scope, mode, permitted root IDs, allowed edge kinds, depth and cursor under existing read/history/review capabilities. Enforce server-side limits and current eligibility on each page; cursors bind principal, scope, filters and generation and fail/restart when these change. Return only authorized nodes/edges with canonical references; totals and truncation indicators describe the visible result only.

`GET /v1/fact-revisions/{revision_id}/document` returns verified Markdown and a base-version token only when the caller may view that revision in the selected mode. Existing fact-revision creation accepts a discriminated input form: structured claim or a strictly parsed Markdown document, never both. Both forms use the same schema/digest service, `propose_fact`, expected base version, idempotency and change-note requirements. A write never implies the ability to read hidden predecessors. Review notes/history retain their own audience checks.

## Framework-neutral memory consumption

Core transports must serve any authenticated client without importing its framework into domain code. MCP exposes narrow tools; versioned HTTP/OpenAPI supports workflow/retriever adapters. Future Dify, Mastra and LangChain adapters map their transport/context formats to these contracts; they do not maintain a second memory store or bypass policy through Hindsight/SQL.

`POST /v1/context` uses the same identity/scope/mode/eligibility/release service as query, with server-capped result count and context budget. It returns a versioned structured bundle of permitted exact fact/publication references, bounded content, authorized citations, validity/epistemic qualifiers, receipt ID and generation/freshness metadata. It performs retrieval without requiring a second answer-generation LLM call. Guests receive only sanitized exact publication references. If a complete qualified fact cannot fit, omit it with a visible-result truncation indicator; never drop its exception to fit a token budget. Requested token budgets identify a supported tokenizer or use a conservative server bound; no unverified exact token-count claim.

Credentials bind a client application and an authenticated principal/delegation. Caller fields such as `user_id`, session name, workspace label or memory namespace never establish authority. A shared app service credential can serve only its explicitly assigned fixed audience unless trusted end-user delegation is verified; do not enable broad cross-user retrieval through framework defaults. Server-side limits, typed errors and retry/idempotency rules remain shared across clients. Agent writes are attributed observations/proposals, never automatic approval or a generic overwrite operation.

Cache only by principal/delegation, validated scope, mode and relevant generations; a receipt/TTL is not continuing permission. Re-fetch before new tool/model use and stop on denied or stale authority. Already delivered content in an external framework's history or logs cannot be recalled by TruthBase; compatibility evidence must distinguish the server release guarantee from client cache/session behavior. Broadly copying the corpus into a framework vector store is an explicit export integration with separate invalidation/retention gates, not the default retrieval path.
