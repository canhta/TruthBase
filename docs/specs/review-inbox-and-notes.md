# Review Inbox, Clarification and Notes

Status: normative product behavior. Related: [review state machine](fact-review-state-machine.md).

## Inbox entries

The inbox groups work by `approval`, `clarification`, `conflict_resolution`, `publication_approval`, `skill_approval` and `cleanup_approval`. These are request kinds, not interchangeable capabilities. A user may see only assigned or otherwise authorized requests.

Each entry shows scoped object ID; exact revision; concise claim; state; reason for review; requester; authorized owner/group; created/updated/expiry times; blocking questions; evidence coverage; previous decision and note; content/evidence change summary; and downstream impact summary. Hide inaccessible evidence titles, counts and notes as well as bodies.

The detail page provides four primary actions for fact review: approve, decline, ask for clarification and comment. `Comment` changes no decision state. `Edit claim` creates a new revision; it is not a silent in-place correction before approval.

## Required decision payload

Every approval, decline, request for clarification, withdrawal, suspension, publication decision and destructive cleanup approval records:

- Exact target ID/revision, digests and expected request version.
- Authenticated actor, scoped authority, policy version and timestamp.
- Reason code and a non-empty human-readable note.
- Referenced evidence/attestations and related requests, when applicable.

A decision note should be concise and evidentiary, not hidden chain-of-thought. Example: "Declined: the ticket proposes 30 days, but the approving email only covers premium customers. Add the customer-tier condition and resubmit."

Whitespace-only notes fail validation. The pilot limit is 4,000 characters per note; longer supporting documents are attached as scoped sources. Notes must not include credentials or unnecessary personal information.

## Note types and audience

Enums are owned by the [domain model](domain-model.md#note-enums). A note is externally visible only through its own reviewed publication content. Internal reviewer notes are never inherited into customer citations.

A note's read permission is the intersection of its target's restrictions and its own audience. Attachments and evidence previews have independent access checks. A PO's review authority does not grant raw email or code access.

Notes are append-only. Amendments retain the prior body and author, except a separately authorized privacy/security redaction replaces sensitive material with a tombstone and records who authorized the redaction. Do not use "immutable audit" as a reason to keep prohibited secrets forever.

## Clarification contract

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

## Expiry, reassignment and escalation

Proposed pilot defaults: reminder after one business day; escalation after three business days; owner-defined calendar/timezone. These are configurable product defaults, not user-approved commitments. No response retains the blocked state. Reassignment requires scoped management authority and an audit note. Avoid duplicate daily tasks for the same blocker.

Expired approval requests do not change a fact to declined; the fact remains unapproved until an authorized fresh request is opened. Preserve the reason for expiry and previous assignment.

## API/UI acceptance

The server enforces required notes and version guards even if the UI is bypassed. Bulk approve is disabled for business rules in the pilot. Notification bodies contain minimal metadata and authenticated links, not sensitive evidence. Review counts are computed over the viewer's authorized queue only.

The agent's user-facing response when blocked is explicit: "This claim needs clarification about customer tier. I created review request RQ-17 for the business owner. It is not approved or available as a current business fact." Show the ID only to principals permitted to see the request.
