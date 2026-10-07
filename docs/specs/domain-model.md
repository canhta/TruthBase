# Domain Model

Status: canonical names, fields and enumerations. Implement equivalent strongly typed schemas. Examples may use readable IDs; production uses opaque IDs with tenant-scoped uniqueness.

## Identity and time

Every persistent object carries `tenant_id`, `project_id`, `created_at`, `created_by` and an opaque ID. Server time is UTC RFC 3339; user display time is configurable. Scope cannot be moved in place. A cross-project correction creates a new scoped object with an authorized link.

Use two time dimensions: `valid_from` / `valid_to` for when a claim applies in the world, and recorded event time for when the platform learned or decided it. Valid intervals are half-open. Null `valid_to` means no known end, not permanent truth. A historical query must specify `as_of_valid_time` and optionally `as_of_recorded_time`; ordinary queries use current valid time and latest recorded state.

## Entities

| Entity | Key fields and constraints |
|---|---|
| SourceRecord | `source_id`, connector kind, external ID, scope, source ACL reference, current revision pointer |
| SourceRevision | Immutable `source_revision_id`, content hash, external revision/commit, event time, ingestion time, payload reference; source status and ACL version are separately tracked |
| EvidenceSpan | Exact source revision, locator, excerpt hash, minimal excerpt or protected reference; source lineage; support/contradict relationship |
| Fact | Stable `fact_id`, kind, scope, semantic identity; pointer to current approved revision where unambiguous |
| Supersession | Exact predecessor/successor revision IDs, effective time, approval decision and scope; append-only replacement record |
| PublicationGrant | Exact publication version, principal/group, state (`pending`, `active`, `revoked`), authorization generation and audit references |
| ReleaseBasis | Source-owner policy ID/version, approved audience/transformation scope, exact source/dependency versions, issuer and revocation generation |
| FactRevision | `fact_revision_id`, sequence, claim payload, semantic layer, epistemic type, validity, evidence IDs, digests, review status and availability |
| ReviewRequest | `target_type` (`fact_revision`, `publication`, `skill_revision`, `cleanup_plan`), exact target version/digests, request kind, policy version, assignee/group, required capabilities, expiry, queue status |
| ReviewDecision | Immutable request, revision, decision action, actor, authority snapshot, reason code, note ID, expected row version, timestamp |
| ReviewNote | Immutable body, author, type, audience, target revision/request, timestamp, optional `amends_note_id` |
| ClarificationItem | Blocking question, rationale, scope, expected answer type, owner, response note, resolution status |
| ConflictSet | Explicit competing revisions, materiality, evidence, resolver and resolution decision |
| DerivedArtifact | Summary/view, complete dependency manifest, input digests, audience, generation, model/prompt version, current eligibility |
| Publication | Immutable content version, exact approved dependencies, sanitized citations, audience, publication review, separate access grants |
| Episode | Scoped interaction/observation/outcome, source lineage and verification status; not automatically a fact |
| SkillRevision | Versioned procedure, scope, dependency manifest, evaluation report, approval and deployment state |
| CleanupPlan | Targets, action, expected generations, justification, retention checks, approvals, execution receipts |
| OutboxEvent | Stable event ID, aggregate version, type, minimal payload, ordering and idempotency metadata |

## Fact revision content

Required immutable revision metadata: `fact_id` (the scoped semantic family) and `supersedes_revision_id` (explicit null when not replacing). Both are included in the content digest. Changing replacement intent requires a new revision.

Required content fields: `statement`, `subject`, `predicate`, `object`, `conditions`, `exceptions`, `kind`, `semantic_layer`, `epistemic_type`, `valid_from`, `valid_to`, `evidence_ids`, `classification`, `authority_basis` and `uncertainty`.

`kind`: `source_observation`, `implementation_observation`, `business_rule`, `decision`, `progress_observation`, `inferred_claim`.

`epistemic_type`: `observed`, `approved_intent`, `inferred`. This field describes the claim, not its review status. A reviewer can approve the accurate statement "this remains an inference" without making its inferred conclusion a confirmed business rule. A normal answer must retain that qualification. Material business certainty requires a reviewed `approved_intent` revision with authority evidence.

`semantic_layer`: `L1`, `L2`, `L3`, `L4` for fact-derived content; L0 source objects are modeled separately. A rule usually lives at L2 and contributes to L3. Classification is independent: `internal`, `confidential`, `restricted`. External visibility is represented by publication, not by changing classification to "public".

`uncertainty` includes reason codes, concise explanation, missing evidence and proposed questions. `confidence_score` is optional and advisory; no approval rule may depend solely on it.

## State dimensions

`review_status`: `draft`, `needs_clarification`, `pending_approval`, `approved`, `declined`, `withdrawn`.

`availability`: `active`, `suspended`, `superseded`, `archived`, `purge_pending`, `purged`.

`active` means not blocked by lifecycle state; it does not imply reviewed, currently effective or readable. An unapproved draft can be active in its review workspace. Only the complete eligibility predicate permits serving.

`review_request_status`: `open`, `resolved`, `cancelled`, `expired`.

`publication_status`: `draft`, `pending_approval`, `approved`, `declined`, `revoked`. Approved publication still requires active grants and eligible dependencies.

Skill states: `proposed`, `evaluating`, `pending_approval`, `approved`, `active`, `retired`, `revoked`, `declined`. They follow a separate procedural-learning workflow.

## Immutability and version binding

Claim payload, scope, evidence set, valid time, semantic classification and uncertainty assertions are immutable within a revision. Content edits produce a new revision. Review and availability state are current projections of append-only events. Notes and decisions are immutable except narrowly authorized privacy redaction with an audit tombstone.

[Digest contract](../contracts/digests.md) defines the exact codec, covered fields and golden vectors. A review binds `digest_codec`, content and evidence digests, and `review_policy_version`. Neither a new codec nor a new policy reinterprets an existing approval.

A source access restriction can change without rewriting factual content: advance ACL/eligibility generations and recheck serving. New source content is a new source revision; new supporting evidence is a new fact revision.

## Eligibility

Eligibility is mode-specific; [retrieval](retrieval-and-answer-contract.md#mode-specific-eligibility) defines the predicates. Common dependency validity checks approval, evidence, lifecycle barriers and unresolved material blockers independently of requester permissions. Current serving additionally checks effective selection, requester/delegation access and projection generation. Publication uses its approved release basis rather than granting the guest raw-source rights. An approved inference remains explicitly labeled.

Historical retrieval has explicit time and history permissions. It does not bypass a current revocation, source restriction or erasure tombstone. Superseded historical records can be shown only in history mode, labeled as historical, with permitted evidence.

## Database integrity

Enforce scope consistency through composite foreign keys or equivalent transactional guards, not application convention alone. Prevent two selected current rules in the same semantic family with overlapping applicability. Use the explicit replacement protocol below. Conditions are not a general-purpose theorem language: a semantic family is the assigned, scoped `fact_id`, not an LLM similarity score. Potential overlap across families or differently scoped conditions requires explicit conflict review; automatic approval or supersession on semantic similarity is forbidden.

Use optimistic concurrency tokens on review requests, fact aggregates, publications and cleanup plans. Decision insertion, status update, pointer change, eligibility-generation update and outbox insertion are one transaction. See [consistency](events-and-consistency.md).

## Temporal replacement

A replacement records `supersedes_revision_id` on the successor proposal. It must share scope and semantic family with the predecessor. Approving the successor atomically creates a Supersession record whose effective time equals the successor's `valid_from`; it does not edit the predecessor's content or `valid_to`.

The predecessor's effective serving interval ends at the earlier of its declared `valid_to` and the approved supersession time. The successor must start strictly after the predecessor's `valid_from`; replacement is forward-only in the first milestone. Its `valid_from` must also be at or after the approval decision’s server-recorded time, captured within the decision transaction. If review completes after the proposed effective time, return `INVALID_TRANSITION`; a revised effective time requires a new revision and review. Backdated replacement or partial replacement of conditions requires a separately specified correction workflow and is rejected by the initial API. At most one approved immediate successor is allowed per predecessor; competing proposals use review/conflict handling.

Selection evaluates these records at query time, including the final release check. Correctness cannot depend on a midnight scheduler. A future successor leaves the predecessor current until its effective time. If the successor later becomes unavailable, the predecessor does not automatically revive: return no current fact until an authorized reviewed replacement resolves the gap. Historical approval and intervals remain inspectable under current history permissions. A material source retraction can suspend both before any scheduled replacement.

## Note enums

`note_type`: `comment`, `approval_reason`, `decline_reason`, `clarification_question`, `clarification_response`, `revision_summary`, `technical_attestation`, `lifecycle_reason`, `amendment`.

`note_audience`: `reviewers_only`, `internal_project`, `publication_safe`. The last is a proposed sharing classification, not a publication grant. Note validation and access rules live in [review notes](review-inbox-and-notes.md).
