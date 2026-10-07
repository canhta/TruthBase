# Fact Review State Machine

Status: canonical workflow specification. This is the authority for approval, decline, clarification and re-submission.

## Meanings

| State | Meaning | Normal answer eligibility |
|---|---|---|
| `draft` | A recorded candidate not ready for review | No |
| `needs_clarification` | A material ambiguity or missing input blocks a decision | No |
| `pending_approval` | A review-ready exact revision awaits an authorized decision | No |
| `approved` | A permitted reviewer accepted this exact revision under a recorded policy | Only with all other eligibility checks |
| `declined` | This proposed revision was rejected, with reasons | No |
| `withdrawn` | The proposal was cancelled or replaced before approval | No |

Declined is a review outcome, not a deletion state and not proof of the inverse claim. Do not use `rejected` as a second database synonym. UI labels may say "Declined" or "Rejected" but the API enum is `declined`.

## Allowed review transitions

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

## Approval guards

An approval must verify current actor identity and scoped `approve_fact` authority; exact request/revision/digests; current policy version; expected request version; source eligibility; complete required attestations; no unresolved clarification/conflict; and separation of duties. Require a non-empty concise approval note even for routine human approval.

The extracting agent cannot be the approver. Default policy also prevents a human proposer approving their own proposal. Policy-defined technical attestation and business approval may be supplied by different authorized people; a business approver must not be forced to read unauthorized code. The review packet can reference a permitted technical attestation, but it cannot invent one or broaden access.

Low-risk deterministic source-observation auto-acceptance is **disabled in v0.1**. A future policy may enable it for a narrowly enumerated connector field and issuer, using a separate service principal, policy-authored note and full audit record. It never covers inferred business rules, external publication or irreversible deletion. Implement no confidence-based auto-approve shortcut.

## Clarification and new evidence

A clarification records what is unclear, why it matters, what evidence is needed, who can answer and what work is blocked. A timeout leaves the fact unapproved and the request expired or reassigned; it never approves by silence.

A response that only explains an existing evidence locator may resolve a question without changing the revision. A response introducing a new rule, exception, date, authority attestation or evidence source changes the reviewed content: create revision N+1, withdraw the open candidate N and issue a new request. Preserve links to all prior questions and notes.

If some claims are clear and others are not, split them into separate atomic candidates. Do not partially approve an ambiguous compound paragraph. Do not invent a "conditionally approved" state to avoid answering a blocking question.

## Decline and resubmission

Decline requires a reason code and note describing the defect. Available reason codes include `incorrect_claim`, `insufficient_evidence`, `contradictory_evidence`, `wrong_scope`, `missing_exception`, `invalid_effective_time`, `duplicate`, `not_authoritative`, `sensitive_content`, `out_of_scope`, `other`.

The same revision never transitions from declined to approved. Correction, appeal or genuine new evidence creates N+1 with `resubmits_revision_id`, a change summary and a response to the earlier decline. Even an appeal with unchanged content is a new revision and request, so decision history remains truthful. The old decline is retained. Only an authorized actor can open an appeal; agents may propose one, not loop indefinitely.

Prevent unchanged re-extraction from repeatedly opening identical declined proposals by a scoped suppression key: tenant + project + normalized claim + source revision/evidence digests + decline decision. New evidence, changed scope or explicit authorized appeal bypasses suppression through the review path, not by erasing the decline.

## Approved revisions and subsequent change

Approval is a historical decision and is not edited into a decline. A later issue can suspend, supersede, archive or revoke availability, with a new note and event. A replacement requires a new reviewed revision. At its effective time, query-time selection excludes the predecessor and its current views. Pointer/index refresh is an optimization and cannot bypass that selection.

A new proposal alone does not invalidate an old approved rule. A material contradiction, retracted authority or invalid evidence does trigger immediate suspension of affected serving content until resolved. A future-effective approved rule does not replace today's rule prematurely.

## Decision concurrency and retries

One open approval request per exact revision/policy. Decision endpoints require idempotency keys and expected versions. Two reviewers racing on the same request cannot both decide it. The loser receives `409 REVISION_CONFLICT`; retrying an already committed identical command returns the original result. Changing a submitted note under the same idempotency key returns `409 IDEMPOTENCY_CONFLICT`.

Approval, decline and clarification decisions append immutable notes and audit events. A reviewer correcting a note adds an amendment; they do not rewrite the decision's history. See [review inbox](review-inbox-and-notes.md) and [API](api-and-mcp-contracts.md).

## Request lifecycle

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

## Replacement approval

Apply [temporal replacement](domain-model.md#temporal-replacement) when a proposal names a predecessor. Approval locks/checks the semantic family as well as the request, so two successors cannot both reserve the same predecessor. Recheck the predecessor and replacement boundary at commit. Source validity and material-conflict suspension remain independent of the replacement schedule.
