# Worked Example - Clarification, Decline, Revision and Approval

All entities below are synthetic. This example demonstrates the canonical [review workflow](../specs/fact-review-state-machine.md), not an already running system.

## Source fixtures

Project: `PRJ-atlas`; tenant: `TEN-demo`.

- `SRC-ticket-1@r1`: ticket proposes extending refund requests from 14 to 30 days. The text does not clearly specify the customer tier.
- `SRC-email-1@r1`: the designated business owner approves a 30-day request window for premium plans, effective 2026-10-01, excluding consumed credits.
- `SRC-code-1@commit-a`: the inspected function still checks 14 days. No deployment evidence was supplied.

The original source artifacts have restricted access. Reviewer-facing evidence can use approved minimal excerpts and scoped technical attestations without granting unrestricted source access.

## Timeline

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

## Expected internal answers

Before step 8: ordinary users do not receive the proposal as current approved business truth. Authorized reviewers may see the candidate and notes in review mode.

After step 8, a permitted PO sees: "The approved premium-plan policy permits refund requests within 30 days, excluding consumed credits, effective October 1. Deployment is not established by the available evidence."

A developer with source access can additionally inspect the commit-pinned 14-day implementation and approved technical observations. The system does not rewrite business intent to match code or claim production behavior without deployment evidence.

A customer sees nothing until a sanitized exact publication version is approved and granted. They never receive the internal decline note or evidence filenames automatically.

## Edge branches

If clarification response merely locates an already included unchanged excerpt, authorized resolution may allow the same revision to be resubmitted. If it introduces new evidence or changes meaning, a new revision is mandatory.

If a reviewer clicks approve on FR-002 after FR-003 replaced it, the decision fails on request/version state. If the same approval is retried with the same idempotency key and body, return the original committed decision. If the note changes under that key, return an idempotency conflict.

If the approval email is later retracted, suspend dependent content and publications immediately. Keep the historical approval event; do not rewrite it into a decline.
