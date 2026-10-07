# Facts and review

## Domain Model

Status: canonical names, fields and enumerations. Implement equivalent strongly typed schemas. Examples may use readable IDs; production uses opaque IDs with tenant-scoped uniqueness.

### Identity and time

Every persistent object carries `tenant_id`, `project_id`, `created_at`, `created_by` and an opaque ID. Server time is UTC RFC 3339; user display time is configurable. Scope cannot be moved in place. A cross-project correction creates a new scoped object with an authorized link.

Use two time dimensions: `valid_from` / `valid_to` for when a claim applies in the world, and recorded event time for when the platform learned or decided it. Valid intervals are half-open. Null `valid_to` means no known end, not permanent truth. A historical query must specify `as_of_valid_time` and optionally `as_of_recorded_time`; ordinary queries use current valid time and latest recorded state.

### Entities

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
| CoverageManifest | Versioned domain/capability inventory, accountable owner, expected questions/behaviors, exact member revisions and explicit gaps; no inherited approval |
| MemorySchedule | Project, enabled flag, timezone/local time, policy/version, inference route, work/cost limits and next resolved slot |
| MemoryRun | Scoped schedule/manual trigger, input manifest/checkpoint, fenced lease, model/prompt/evaluator versions, proposal IDs, cost evidence and terminal outcome |
| BackupPolicy | Project/audience, approved repository ID/branch, included content classes, connection ID/version and policy version |
| BackupReceipt | Snapshot manifest/hash, expected remote head, exact verified commit or unknown/failed result, exported/excluded coverage and separate control-ledger backup reference |
| OutboxEvent | Stable event ID, aggregate version, type, minimal payload, ordering and idempotency metadata |

### Fact revision content

Required immutable revision metadata: `fact_id` (the scoped semantic family) and `supersedes_revision_id` (explicit null when not replacing). Both are included in the content digest. Changing replacement intent requires a new revision.

Required content fields: `statement`, `subject`, `predicate`, `object`, `conditions`, `exceptions`, `kind`, `semantic_layer`, `epistemic_type`, `valid_from`, `valid_to`, `evidence_ids`, `classification`, `authority_basis` and `uncertainty`.

`kind`: `source_observation`, `implementation_observation`, `business_rule`, `decision`, `progress_observation`, `inferred_claim`.

`epistemic_type`: `observed`, `approved_intent`, `inferred`. This field describes the claim, not its review status. A reviewer can approve the accurate statement "this remains an inference" without making its inferred conclusion a confirmed business rule. A normal answer must retain that qualification. Material business certainty requires a reviewed `approved_intent` revision with authority evidence.

`semantic_layer`: `L1`, `L2`, `L3`, `L4` for fact-derived content; L0 source objects are modeled separately. A rule usually lives at L2 and contributes to L3. Classification is independent: `internal`, `confidential`, `restricted`. External visibility is represented by publication, not by changing classification to "public".

`uncertainty` includes reason codes, concise explanation, missing evidence and proposed questions. `confidence_score` is optional and advisory; no approval rule may depend solely on it.

### State dimensions

`review_status`: `draft`, `needs_clarification`, `pending_approval`, `approved`, `declined`, `withdrawn`.

`availability`: `active`, `suspended`, `superseded`, `archived`, `purge_pending`, `purged`.

`active` means not blocked by lifecycle state; it does not imply reviewed, currently effective or readable. An unapproved draft can be active in its review workspace. Only the complete eligibility predicate permits serving.

`review_request_status`: `open`, `resolved`, `cancelled`, `expired`.

`publication_status`: `draft`, `pending_approval`, `approved`, `declined`, `revoked`. Approved publication still requires active grants and eligible dependencies.

Skill states: `proposed`, `evaluating`, `pending_approval`, `approved`, `active`, `retired`, `revoked`, `declined`. They follow a separate procedural-learning workflow.

### Immutability and version binding

Claim payload, scope, evidence set, valid time, semantic classification and uncertainty assertions are immutable within a revision. Content edits produce a new revision. Review and availability state are current projections of append-only events. Notes and decisions are immutable except narrowly authorized privacy redaction with an audit tombstone.

[Digest contract](facts.md#digest-contract) defines the exact codec, covered fields and golden vectors. A review binds `digest_codec`, content and evidence digests, and `review_policy_version`. Neither a new codec nor a new policy reinterprets an existing approval.

A source access restriction can change without rewriting factual content: advance ACL/eligibility generations and recheck serving. New source content is a new source revision; new supporting evidence is a new fact revision.

### Eligibility

Eligibility is mode-specific; [retrieval](access.md#mode-specific-eligibility) defines the predicates. Common dependency validity checks approval, evidence, lifecycle barriers and unresolved material blockers independently of requester permissions. Current serving additionally checks effective selection, requester/delegation access and projection generation. Publication uses its approved release basis rather than granting the guest raw-source rights. An approved inference remains explicitly labeled.

Historical retrieval has explicit time and history permissions. It does not bypass a current revocation, source restriction or erasure tombstone. Superseded historical records can be shown only in history mode, labeled as historical, with permitted evidence.

### Database integrity

Enforce scope consistency through composite foreign keys or equivalent transactional guards, not application convention alone. Prevent two selected current rules in the same semantic family with overlapping applicability. Use the explicit replacement protocol below. Conditions are not a general-purpose theorem language: a semantic family is the assigned, scoped `fact_id`, not an LLM similarity score. Potential overlap across families or differently scoped conditions requires explicit conflict review; automatic approval or supersession on semantic similarity is forbidden.

Use optimistic concurrency tokens on review requests, fact aggregates, publications and cleanup plans. Decision insertion, status update, pointer change, eligibility-generation update and outbox insertion are one transaction. See [consistency](consistency.md#events-concurrency-and-consistency).

### Temporal replacement

A replacement records `supersedes_revision_id` on the successor proposal. It must share scope and semantic family with the predecessor. Approving the successor atomically creates a Supersession record whose effective time equals the successor's `valid_from`; it does not edit the predecessor's content or `valid_to`.

The predecessor's effective serving interval ends at the earlier of its declared `valid_to` and the approved supersession time. The successor must start strictly after the predecessor's `valid_from`; replacement is forward-only in the first milestone. Its `valid_from` must also be at or after the approval decision’s server-recorded time, captured within the decision transaction. If review completes after the proposed effective time, return `INVALID_TRANSITION`; a revised effective time requires a new revision and review. Backdated replacement or partial replacement of conditions requires a separately specified correction workflow and is rejected by the initial API. At most one approved immediate successor is allowed per predecessor; competing proposals use review/conflict handling.

Selection evaluates these records at query time, including the final release check. Correctness cannot depend on a midnight scheduler. A future successor leaves the predecessor current until its effective time. If the successor later becomes unavailable, the predecessor does not automatically revive: return no current fact until an authorized reviewed replacement resolves the gap. Historical approval and intervals remain inspectable under current history permissions. A material source retraction can suspend both before any scheduled replacement.

### Note enums

`note_type`: `comment`, `approval_reason`, `decline_reason`, `clarification_question`, `clarification_response`, `revision_summary`, `technical_attestation`, `lifecycle_reason`, `amendment`.

`note_audience`: `reviewers_only`, `internal_project`, `publication_safe`. The last is a proposed sharing classification, not a publication grant. Note validation and access rules live in [review notes](facts.md#review-inbox-clarification-and-notes).

## Fact Review State Machine

Status: canonical workflow specification. This is the authority for approval, decline, clarification and re-submission.

### Meanings

| State | Meaning | Normal answer eligibility |
|---|---|---|
| `draft` | A recorded candidate not ready for review | No |
| `needs_clarification` | A material ambiguity or missing input blocks a decision | No |
| `pending_approval` | A review-ready exact revision awaits an authorized decision | No |
| `approved` | A permitted reviewer accepted this exact revision under a recorded policy | Only with all other eligibility checks |
| `declined` | This proposed revision was rejected, with reasons | No |
| `withdrawn` | The proposal was cancelled or replaced before approval | No |

Declined is a review outcome, not a deletion state and not proof of the inverse claim. Do not use `rejected` as a second database synonym. UI labels may say "Declined" or "Rejected" but the API enum is `declined`.

### Allowed review transitions

| From | Action | To | Required guards |
|---|---|---|---|
| `draft` | `request_clarification` | `needs_clarification` | At least one specific blocking question, owner and note |
| `draft` | `submit_for_approval` | `pending_approval` | Complete review packet; no unresolved blockers; policy and approver group resolved |
| `draft` | `withdraw` | `withdrawn` | Authorized proposer/owner and note |
| `needs_clarification` | `submit_for_approval` | `pending_approval` | All blockers resolved; submitted claim and evidence are unchanged |
| `needs_clarification` | `withdraw` | `withdrawn` | Authorized owner and note |
| `pending_approval` | `request_clarification` | `needs_clarification` | Authorized reviewer, question and note; approval request resolved as clarification |
| `pending_approval` | `approve` | `approved` | All approval guards below |
| `pending_approval` | `decline` | `declined` | Authorized reviewer, reason code, non-empty note and current version |
| `pending_approval` | `withdraw` | `withdrawn` | Authorized owner; close outstanding review requests |

Any unlisted transition is forbidden. A reviewer cannot approve directly from `needs_clarification`, including through bulk review. Clarification response is not itself an approval action.

### Approval guards

An approval must verify current actor identity and scoped `approve_fact` authority; exact request/revision/digests; current policy version; expected request version; source eligibility; complete required attestations; no unresolved clarification/conflict; and separation of duties. Require a non-empty concise approval note even for routine human approval.

The extracting agent cannot be the approver. Default policy also prevents a human proposer approving their own proposal. Policy-defined technical attestation and business approval may be supplied by different authorized people; a business approver must not be forced to read unauthorized code. The review packet can reference a permitted technical attestation, but it cannot invent one or broaden access.

Low-risk deterministic source-observation auto-acceptance is **disabled in v0.1**. A future policy may enable it for a narrowly enumerated connector field and issuer, using a separate service principal, policy-authored note and full audit record. It never covers inferred business rules, external publication or irreversible deletion. Implement no confidence-based auto-approve shortcut.

### Clarification and new evidence

A clarification records what is unclear, why it matters, what evidence is needed, who can answer and what work is blocked. A timeout leaves the fact unapproved and the request expired or reassigned; it never approves by silence.

A response that only explains an existing evidence locator may resolve a question without changing the revision. A response introducing a new rule, exception, date, authority attestation or evidence source changes the reviewed content: create revision N+1, withdraw the open candidate N and issue a new request. Preserve links to all prior questions and notes.

If some claims are clear and others are not, split them into separate atomic candidates. Do not partially approve an ambiguous compound paragraph. Do not invent a "conditionally approved" state to avoid answering a blocking question.

### Decline and resubmission

Decline requires a reason code and note describing the defect. Available reason codes include `incorrect_claim`, `insufficient_evidence`, `contradictory_evidence`, `wrong_scope`, `missing_exception`, `invalid_effective_time`, `duplicate`, `not_authoritative`, `sensitive_content`, `out_of_scope`, `other`.

The same revision never transitions from declined to approved. Correction, appeal or genuine new evidence creates N+1 with `resubmits_revision_id`, a change summary and a response to the earlier decline. Even an appeal with unchanged content is a new revision and request, so decision history remains truthful. The old decline is retained. Only an authorized actor can open an appeal; agents may propose one, not loop indefinitely.

Prevent unchanged re-extraction from repeatedly opening identical declined proposals by a scoped suppression key: tenant + project + normalized claim + source revision/evidence digests + decline decision. New evidence, changed scope or explicit authorized appeal bypasses suppression through the review path, not by erasing the decline.

### Approved revisions and subsequent change

Approval is a historical decision and is not edited into a decline. A later issue can suspend, supersede, archive or revoke availability, with a new note and event. A replacement requires a new reviewed revision. At its effective time, query-time selection excludes the predecessor and its current views. Pointer/index refresh is an optimization and cannot bypass that selection.

A new proposal alone does not invalidate an old approved rule. A material contradiction, retracted authority or invalid evidence does trigger immediate suspension of affected serving content until resolved. A future-effective approved rule does not replace today's rule prematurely.

### Decision concurrency and retries

One open approval request per exact revision/policy. Decision endpoints require idempotency keys and expected versions. Two reviewers racing on the same request cannot both decide it. The loser receives `409 REVISION_CONFLICT`; retrying an already committed identical command returns the original result. Changing a submitted note under the same idempotency key returns `409 IDEMPOTENCY_CONFLICT`.

Approval, decline and clarification decisions append immutable notes and audit events. A reviewer correcting a note adds an amendment; they do not rewrite the decision's history. See [review inbox](facts.md#review-inbox-clarification-and-notes) and [API](api.md#proposed-platform-api-and-mcp-contracts).

### Request lifecycle

Request status is separate from revision review status. An open request has a row version and server-time expiry. Expiry is enforced on every decision, even if an expiry worker has not run.

| Command | Request result | Revision result | Guard |
|---|---|---|---|
| Expire | `open` → `expired` | Unchanged; remains unapproved | Server time >= expiry; append expiry event |
| Reassign | `open` → `open`, version increments | Unchanged | `manage_review`, valid new assignee and note |
| Renew approval | New `open` request; old remains `expired`/`cancelled` | `pending_approval` → `pending_approval` | `request_review`, exact unchanged revision, current policy, no open approval request, fresh readiness checks and note |
| Renew clarification | New `open` clarification request | Remains `needs_clarification` | Unresolved questions preserved; `manage_review` and note |
| Decide | `open` → `resolved` | Per transition table | Unexpired request and all decision guards |
| Cancel on withdrawal | `open` → `cancelled` | `withdrawn` | Authorized withdrawal with note |

Renewal is a request-lifecycle operation, not reapproval or a content edit. It uses the existing review-requests route with `renews_request_id` and expected fact version. A policy change requires a fresh request bound to the new policy; the previous open request is cancelled in the same transaction. Decisions on expired/cancelled/resolved requests return `409 INVALID_TRANSITION`, except a permitted exact idempotent replay. Request closure, revision projection, note, audit and outbox changes commit together.

### Replacement approval

Apply [temporal replacement](facts.md#temporal-replacement) when a proposal names a predecessor. Approval locks/checks the semantic family as well as the request, so two successors cannot both reserve the same predecessor. Recheck the predecessor and replacement boundary at commit. Source validity and material-conflict suspension remain independent of the replacement schedule.

## Review Inbox, Clarification and Notes

Status: normative product behavior. Related: [review state machine](facts.md#fact-review-state-machine).

### Inbox entries

The inbox groups work by `approval`, `clarification`, `conflict_resolution`, `publication_approval`, `skill_approval` and `cleanup_approval`. These are request kinds, not interchangeable capabilities. A user may see only assigned or otherwise authorized requests.

Each entry shows scoped object ID; exact revision; concise claim; state; reason for review; requester; authorized owner/group; created/updated/expiry times; blocking questions; evidence coverage; previous decision and note; content/evidence change summary; and downstream impact summary. Hide inaccessible evidence titles, counts and notes as well as bodies.

The detail page provides four primary actions for fact review: approve, decline, ask for clarification and comment. `Comment` changes no decision state. `Edit claim` creates a new revision; it is not a silent in-place correction before approval.

### Required decision payload

Every approval, decline, request for clarification, withdrawal, suspension, publication decision and destructive cleanup approval records:

- Exact target ID/revision, digests and expected request version.
- Authenticated actor, scoped authority, policy version and timestamp.
- Reason code and a non-empty human-readable note.
- Referenced evidence/attestations and related requests, when applicable.

A decision note should be concise and evidentiary, not hidden chain-of-thought. Example: "Declined: the ticket proposes 30 days, but the approving email only covers premium customers. Add the customer-tier condition and resubmit."

Whitespace-only notes fail validation. The pilot limit is 4,000 characters per note; longer supporting documents are attached as scoped sources. Notes must not include credentials or unnecessary personal information.

### Note types and audience

Enums are owned by the [domain model](facts.md#note-enums). A note is externally visible only through its own reviewed publication content. Internal reviewer notes are never inherited into customer citations.

A note's read permission is the intersection of its target's restrictions and its own audience. Attachments and evidence previews have independent access checks. A PO's review authority does not grant raw email or code access.

Notes are append-only. Amendments retain the prior body and author, except a separately authorized privacy/security redaction replaces sensitive material with a tombstone and records who authorized the redaction. Do not use "immutable audit" as a reason to keep prohibited secrets forever.

### Clarification contract

A useful request answers:

| Field | Example |
|---|---|
| Question | Does the 30-day refund window apply to all plans or premium plans only? |
| Why blocking | The scope changes customer eligibility. |
| Known facts | The ticket says 30 days; the approval email mentions premium. |
| Needed evidence | A decision by the designated business owner or an existing approved policy. |
| Expected response | A plan-scope choice, effective date and evidence reference. |
| Owner | Project-scoped business approver group. |
| Blocked operation | Approval and publication of this proposed rule. |
| Safe continuation | Inspect tests and code without asserting the new rule as approved. |

Responses are notes by identified principals. A free-text "yes" is insufficient where the question is multi-part or ambiguous. The agent can restate what was resolved and propose the next revision, but cannot simulate the human's approval.

### Expiry, reassignment and escalation

Proposed pilot defaults: reminder after one business day; escalation after three business days; owner-defined calendar/timezone. These are configurable product defaults, not user-approved commitments. No response retains the blocked state. Reassignment requires scoped management authority and an audit note. Avoid duplicate daily tasks for the same blocker.

Expired approval requests do not change a fact to declined; the fact remains unapproved until an authorized fresh request is opened. Preserve the reason for expiry and previous assignment.

### API/UI acceptance

The server enforces required notes and version guards even if the UI is bypassed. Bulk approve is disabled for business rules in the pilot. Notification bodies contain minimal metadata and authenticated links, not sensitive evidence. Review counts are computed over the viewer's authorized queue only.

The agent's user-facing response when blocked is explicit: "This claim needs clarification about customer tier. I created review request RQ-17 for the business owner. It is not approved or available as a current business fact." Show the ID only to principals permitted to see the request.

## Ingestion and Evidence

Status: normative pipeline. No connector is authorized to ingest production data merely because this document exists.

### Pipeline

```text
Authorized source event/import
 -> validate scope and source permission
 -> store immutable source revision + hash
 -> normalize and segment with source locators
 -> extract atomic candidate claims in quarantine
 -> resolve entities inside allowed scope
 -> detect duplicate/change/conflict
 -> create revision and required review/clarification request
 -> after approval: emit projection work
```

Separate the ability to read a source from permission to send it to a model. A connector service account's broad visibility is not inherited by every platform user. Preserve source-level restrictions on originals and derivatives unless a reviewed declassification/publication explicitly permits a narrower summary.

### Source envelope

Required: connector kind; tenant/project; external source ID; external revision or immutable snapshot hash; source event time; observed time; source ACL reference/version; payload location; content hash; deletion/restriction status; provenance for copied/quoted content.

Ingestion idempotency key: connector + scope + external ID + revision/hash + pipeline version. A pipeline-version change may re-extract, but it must reuse the source revision and apply candidate deduplication. Do not duplicate a fact because an event was retried.

Webhooks/events provide prompt updates; reconciliation detects missed events. An absent item in an incomplete source listing is not evidence of deletion. Permission loss, API error, deletion and source correction are distinct events.

### Ticket extraction

Preserve descriptions, comment authors/timestamps, status history, decision links, acceptance criteria, due dates and project-specific field mapping. Discover configurable field IDs and workflow mappings; do not hardcode an organization's custom fields into shared logic.

Represent "ticket is Done" as a source status observation. Represent "feature is released" only with permitted deployment evidence. Keep proposals, questions and explicit approvals separate. A comment's recency does not prove author authority.

### Email extraction

Process messages individually with immutable message IDs, thread context, timestamps and quote boundaries. The same original decision quoted in multiple replies is one underlying evidence source, not multiple independent confirmations. Preserve language of conditions, uncertainty, exceptions and proposed versus approved wording.

A forwarded message is not proof that the forwarder approved its contents. Attachment access is checked separately. Extract only minimal permitted content; do not retain entire personal mailboxes to support a single business fact.

### Code and test extraction

Use commit-pinned file paths, symbol names, line spans and content hashes. Lines are meaningful only with a source revision. Prefer parser-based structure where supported; uncertain parser/model output remains a candidate. Separate implementation observation from business intent.

Code is untrusted input. Do not run imported scripts, install repository dependencies, open unsafe archives or execute tests just because a source asks you to. Executing code requires an isolated, explicitly authorized task. A test passing in a sandbox does not prove deployment.

Deployment evidence includes environment, artifact/commit identity, execution result and time. A release claim must connect the relevant implementation to the environment, not merely cite a merged PR.

### Atomic claim extraction

Follow [fact boundaries and system coverage](#fact-boundaries-and-system-coverage). Extraction must preserve a complete independently reviewable rule; neither fragment it into context-free tokens nor bundle unrelated rules into one approval.

For each candidate preserve subject, predicate, value, conditions, exceptions, time, epistemic type, source spans and authority basis. Do not strip negatives, customer tiers, thresholds or exclusions during summarization. Split unrelated assertions rather than approving a paragraph as one fact.

Use a deterministic schema validator after extraction. Malformed/unsupported content enters quarantine with a reason; it never falls back to unchecked free text. Claim confidence helps prioritize review, not bypass it.

### Change and conflict policy

Exact duplicate: reuse the scoped candidate or link provenance without creating a second review. New supporting evidence: create a new revision when the review-bound evidence set changes. Contradiction: create a conflict set; material contradictions suspend affected serving content until resolved. Fresh proposed business intent alone is not automatically a contradiction to the current approved rule.

Source deletion/restriction: immediately advance eligibility generation, then assess surviving evidence and follow [lifecycle](lifecycle.md#lifecycle-retention-and-cleanup). Do not assume every derived claim must be physically deleted if independently valid evidence remains; do not keep serving before that assessment succeeds.

### Review readiness

A candidate is ready only when required fields, exact source spans, scope, validity and authority evidence are present, and no blocking uncertainty remains. Otherwise use [CLARIFICATION_REQUEST](facts.md#clarification-contract). Source extraction cannot directly call the approval endpoint.

## Digest contract

Owner: domain model. Codec ID: `gm-json-v1`. This is a platform encoding, not an upstream API. Implement it once in the domain package; clients echo server digests.

### Canonical bytes

1. Validate a typed payload before encoding. Reject duplicate object keys, unknown schema fields, non-finite values, floating-point numbers and unpaired Unicode surrogates. Allowed JSON values are objects, arrays, Unicode strings, booleans, null and integers in [-9007199254740991, 9007199254740991]. Exact decimal business values use schema-declared decimal strings; never silently round a float.
2. Sort object keys by Unicode scalar value. Preserve array order except the explicitly set-valued arrays below. Keep string code points unchanged: no case folding, trimming or Unicode normalization. Validation of a blank note is independent of its stored text.
3. Encode compact JSON as UTF-8 with no BOM, spaces or trailing newline. Escape quote and backslash; use `\b`, `\t`, `\n`, `\f`, `\r` for those controls and lowercase `\u00xx` for other U+0000–001F controls. Leave slash and other Unicode characters unescaped. Integers use base ten without leading zeros; zero is `0`.
4. Hash those bytes with SHA-256. Return `sha256:` followed by 64 lowercase hexadecimal characters. Include `digest_codec=gm-json-v1` in the review request and decision. A codec change requires new review requests; existing digest bindings remain historical.

Normalize all valid-time values to UTC `YYYY-MM-DDTHH:MM:SS.ffffffZ` before constructing a digest envelope. Null `valid_to` remains explicit. Required fields cannot be omitted or converted between null, empty string and empty array.

### Fact envelopes

Content envelope: `{domain: "gm.fact-content.v1", tenant_id, project_id, fact_id, supersedes_revision_id, claim}`. `claim` contains every required content field listed in the domain model, including uncertainty, authority basis, evidence IDs and epistemic type. Sort `evidence_ids` by Unicode scalar value and reject duplicates. Conditions/exceptions and all other arrays retain their validated order; reordering them requires a new revision. Revision IDs, review status, lifecycle state, confidence scores and mutable ACL generations are excluded.

Evidence envelope: `{domain: "gm.fact-evidence.v1", tenant_id, project_id, evidence}`. Sort evidence entries by `evidence_id`; reject duplicates. Each entry contains exactly `evidence_id`, `source_revision_id`, `source_content_hash`, `locator`, `excerpt_hash`, `relationship` (`support` or `contradict`), and `attestations`. Sort attestations by `attestation_id`; each contains that ID and its immutable `content_digest`. The locator is the validated source-type locator object, not a floating link. Evidence entries must match the content envelope's evidence IDs exactly.

Resolve hashes/attestations from canonical storage, never from caller assertions. Mutable access generations are checked separately and cannot alter an approved digest. Amended authority evidence needs a new revision; a revoked attestation blocks eligibility immediately.

### Publication envelopes

Content: `{domain: "gm.publication-content.v1", tenant_id, project_id, content, intended_audience, sanitized_citations}`. Citation order is preserved. Evidence: `{domain: "gm.publication-evidence.v1", tenant_id, project_id, dependencies, release_basis}`. Sort dependencies by `fact_revision_id`; each contains that ID, `digest_codec`, `content_digest` and `evidence_digest`. Reject duplicates. `release_basis` contains the exact basis ID, issuer, policy ID/version, scoped audience/transformation and its immutable content digest. Current basis/revocation generations are checked separately at approval and read time.

### Golden vectors and acceptance

[Golden vectors](digest-vectors.json) contain complete fact envelopes, exact canonical UTF-8 text and hashes. [M03](https://github.com/canhta/TruthBase/issues/4) must use them as independent expected values, then test reordered object keys/evidence sets, a changed exception/uncertainty/authority/epistemic type, duplicate keys, omitted/null fields, Unicode and prohibited numbers. Equivalent object-key order must hash identically; meaningful content or evidence changes must not. A serialization unit test does not prove approval binding: [M05](https://github.com/canhta/TruthBase/issues/6) also verifies stale-digest rejection and unchanged canonical state after failure.

## Worked Example - Clarification, Decline, Revision and Approval

All entities below are synthetic. This example demonstrates the canonical [review workflow](facts.md#fact-review-state-machine), not an already running system.

### Source fixtures

Project: `PRJ-atlas`; tenant: `TEN-demo`.

- `SRC-ticket-1@r1`: ticket proposes extending refund requests from 14 to 30 days. The text does not clearly specify the customer tier.
- `SRC-email-1@r1`: the designated business owner approves a 30-day request window for premium plans, effective 2026-10-01, excluding consumed credits.
- `SRC-code-1@commit-a`: the inspected function still checks 14 days. No deployment evidence was supplied.

The original source artifacts have restricted access. Reviewer-facing evidence can use approved minimal excerpts and scoped technical attestations without granting unrestricted source access.

### Timeline

| Step | Command and actor | State/result | Required note |
|---|---|---|---|
| 1 | Extractor proposes `FR-refund-001`: "Customers can request a refund within 30 days." | `draft`; not serveable | Candidate uncertainty: tier and exception unclear |
| 2 | Extractor requests clarification | `needs_clarification`; request `RQ-clarify-001` open | "The ticket does not establish plan scope. Which customer tier is covered, and are consumed credits excluded?" |
| 3 | Authorized owner responds, linking email revision | Response recorded; no approval | "The approved change covers premium plans only and excludes consumed credits. See the decision email effective October 1." |
| 4 | Extractor creates `FR-refund-002` but accidentally omits the consumed-credit exception | FR-001 withdrawn; FR-002 draft; new evidence/content digests | "Added premium-plan scope from the owner's clarification. Replaces the earlier incomplete proposal." |
| 5 | Readiness checks pass structurally; extractor submits FR-002 | `pending_approval`; `RQ-approve-002` open | Submission summary identifies changed scope and evidence |
| 6 | Business reviewer declines FR-002 | `declined`; no serving projection | `missing_exception`: "The decision excludes consumed credits. Include that exception and resubmit. The 30-day premium scope is otherwise supported." |
| 7 | Extractor proposes `FR-refund-003` with tier, exception and effective date | New draft linked to FR-002; old decline unchanged | "Added the consumed-credit exclusion identified in the decline. Preserved premium scope and October 1 effective date." |
| 8 | FR-003 is submitted and business reviewer approves | `approved`; serving eligibility evaluated separately | `verified_against_evidence`: "Matches the business owner's decision: premium plans, 30-day request window, excluding consumed credits, effective October 1. This is business intent, not deployment confirmation." |
| 9 | Projection worker indexes eligible FR-003 | Ready canonical-linked internal projection | Worker receipt; no new business decision |
| 10 | Publication owner proposes a sanitized customer version | Publication remains draft/pending until separate approval and grant | Publication approval note confirms wording and audience |

The readiness checker in step 5 failed to detect a semantic omission. Human decline correctly catches it. Record this as an extraction-evaluation failure; do not reinterpret the later approval as proof the checker was correct.

### Expected internal answers

Before step 8: ordinary users do not receive the proposal as current approved business truth. Authorized reviewers may see the candidate and notes in review mode.

After step 8, a permitted PO sees: "The approved premium-plan policy permits refund requests within 30 days, excluding consumed credits, effective October 1. Deployment is not established by the available evidence."

A developer with source access can additionally inspect the commit-pinned 14-day implementation and approved technical observations. The system does not rewrite business intent to match code or claim production behavior without deployment evidence.

A customer sees nothing until a sanitized exact publication version is approved and granted. They never receive the internal decline note or evidence filenames automatically.

### Edge branches

If clarification response merely locates an already included unchanged excerpt, authorized resolution may allow the same revision to be resubmitted. If it introduces new evidence or changes meaning, a new revision is mandatory.

If a reviewer clicks approve on FR-002 after FR-003 replaced it, the decision fails on request/version state. If the same approval is retried with the same idempotency key and body, return the original committed decision. If the note changes under that key, return an idempotency conflict.

If the approval email is later retracted, suspend dependent content and publications immediately. Keep the historical approval event; do not rewrite it into a decline.

## Markdown content storage

Logical entities above are API/domain shapes, not a requirement to store every field in a database column. Each immutable content revision has one Markdown file. The control ledger registers its scope, opaque object/revision IDs, relative storage key, byte hash and semantic digests. No mutable approval, permission, grant or revocation fields are authoritative in a file.

```text
<data-root>/tenants/<tenant-id>/projects/<project-id>/
  sources/<source-id>/<source-revision-id>.md
  facts/<fact-id>/<fact-revision-id>.md
  notes/<note-id>.md
  publications/<publication-id>.md
  attachments/<attachment-id>/<blob-id>
```

This is private runtime data in a Docker volume, outside the source monorepo and public Git repository. IDs are server-issued safe path segments, never user-provided paths or source titles. Do not create `latest.md` copies: current selection is a control-ledger query. Revision history is required business history, not two competing stores of current content.

Use UTF-8 Markdown with a YAML frontmatter mapping. Parse only a strict JSON-compatible subset: reject duplicate keys, custom tags, anchors/aliases, implicit timestamps, non-finite numbers and oversized/deep documents. Schema version, entity kind, scope and object/revision IDs are required. The complete body after the closing delimiter is the entity's text field; the format has no ungoverned prose appendix. Serialize deterministically with LF line endings; parser/serializer round trips must preserve validated content.

For facts, the body maps to `claim.statement`; frontmatter contains the other immutable claim fields, `fact_id`, `supersedes_revision_id` and evidence bindings defined by the existing digest contract. Do not also repeat the statement in frontmatter. Publication body maps to `content`; its immutable audience, sanitized citations and dependency/release-basis bindings are frontmatter. Review-note body maps to the immutable note text; author/audience/target/amendment metadata is frontmatter, validated against the authenticated command. Text source snapshots keep exact original-byte hashes and protected original references when normalization changes bytes; locators must identify which representation they address.

Keep `gm-json-v1` as the semantic digest codec: validated file fields reconstruct the existing envelopes. Add a separate SHA-256 `file_byte_hash` over the exact stored file for integrity. A cosmetic change may preserve semantic digest but cannot mutate an existing registered file; imported edits create a new revision requiring review. File frontmatter cannot approve itself or import someone else's authority.

The service owns committed-file writes. UI editing and authorized offline imports produce new candidates, never in-place changes to approved files. Read committed bytes once, verify their byte hash and semantic binding, then use those verified bytes throughout the request. Missing, modified, unregistered or mismatched files fail closed; do not fall back to an index copy. Importing an exported file restores content only, never approval or access. File deletion does not bypass the lifecycle/revocation API.

## Provenance for every mutation

Every stored object has a server-recorded creator and scope. Every mutation, including ingestion, candidate editing, review notes, decisions, grants, configuration, scheduled runs and backups, produces an immutable audit event with event/command ID, object/revision ID, actor principal and type, authenticated delegator or initiating principal where applicable, timestamp, action, reason, and before/after version or digest. Service jobs identify their service principal, run ID and the authorizing configuration/policy version; do not attribute unattended work to a human who did not perform it. AI-authored changes also identify model/provider/prompt version and exact input lineage. API bodies, Markdown and model output cannot choose the authenticated audit actor.

Original source author, submitting user, extracting agent, editor and approving reviewer are distinct roles. Imported content records the real importer even when the external author is unknown; preserve `unknown` external authorship instead of inventing it. A later content edit records a new revision/actor and its predecessor; original authorship and review history stay intact. Configuration/credential events audit metadata and safe changes, never secret values.

Mutation metadata and its audit event commit with the control-state transaction; failure to persist required provenance prevents acceptance. Rejected calls cannot alter the target and use content-free security diagnostics. Missing provenance makes legacy/imported knowledge unverified and ineligible until reconciled through review. Canonical audit events are append-only to runtime roles; privileged database/backup administrators remain a separate trusted operational boundary, not a claim of cryptographic tamper-proofing.

The web review packet must answer: who supplied the evidence, who proposed/edited the claim, what changed, why, which exact sources support it, who reviewed it and under which policy. The API provides the same scoped history. Review decisions remain separate from content authorship; a repository commit author or model signature cannot stand in for an approver.

## Fact boundaries and system coverage

A fact is one independently reviewable assertion with its applicability, conditions, exceptions, evidence and validity. Choose the boundary by the decision a reviewer can accept or decline, not by sentence count, token count or a target number of facts. Split assertions that have independent truth, owners, evidence or change lifecycles. Keep conditions and exceptions required to interpret one assertion together.

For example, “Premium customers may request refunds within 30 days, excluding consumed credits” is one qualified refund rule. Do not store “refunds allowed”, “premium”, “30 days” and the exclusion as four standalone facts. Conversely, eligibility, settlement timing, accounting treatment and notification delivery need separate facts when they have separate owners/evidence. A decision-table row can be one fact when it expresses a complete rule; shared definitions must be explicitly bound to reviewed revisions rather than silently inherited from mutable prose.

Use stable fact families within project → domain → capability → rule/behavior. Domain/capability IDs and versioned assignment changes are catalog metadata; classification never widens scope or overrides ACLs. Human-readable domain views are generated from scoped catalog queries, not duplicate editable copies in parallel folders. The immutable ID-based Markdown paths remain authoritative and are not renamed when the taxonomy changes.

A versioned coverage manifest names an explicit inventory of expected business questions/behaviors, owner and exact fact revisions or known gaps. It may group approved facts into a workflow or rule set without duplicating their text. Grouping does not approve members; new prose asserting a cross-fact conclusion is a separate derived candidate needing lineage/review. Each member remains independently versioned and subject to current eligibility. Supersession makes a manifest's affected coverage stale until an authorized update selects the reviewed replacement.

Review can show a bounded group for context, but must retain an explicit decision/note for each exact revision. No blanket project approval or one-click approval of an unseen generated inventory. Detect missing, duplicate and conflicting coverage against the declared inventory; do not infer full-system completeness from an LLM scan. Unknown coverage is visible as a gap, not filled with plausible claims. Metrics are scoped to a versioned denominator and viewer permissions; hidden facts or gap counts must not leak across access boundaries.

## Deliberate intake

A configured connector or available LLM key is not permission to crawl. Each import/extraction job binds an initiating actor or operator-authorized schedule to an explicit source allowlist, revision/time window, purpose, project/audience, maximum source bytes/items, candidate limit, model/token/cost budget and review-queue capacity. Defaults never scan entire organizations, mailboxes or repositories. Exhausted limits stop/checkpoint and report remaining work; agents cannot widen them or recursively follow links outside the selected scope.

Apply deterministic filtering, unchanged-source detection and exact deduplication before model extraction. Admit candidates only after typed validation, evidence-locator checks, provenance and granularity checks. Missing support produces a visible gap/clarification or quarantined record, not an invented fact. Repeated rejected/unmodified proposals are suppressed until inputs or a recorded reviewer instruction materially change. Queue saturation pauses further extraction and exposes the backlog; it does not silently discard evidence or auto-approve to clear the queue. The daily maintenance loop follows these same intake limits.
