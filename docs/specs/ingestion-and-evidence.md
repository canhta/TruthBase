# Ingestion and Evidence

Status: normative pipeline. No connector is authorized to ingest production data merely because this document exists.

## Pipeline

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

## Source envelope

Required: connector kind; tenant/project; external source ID; external revision or immutable snapshot hash; source event time; observed time; source ACL reference/version; payload location; content hash; deletion/restriction status; provenance for copied/quoted content.

Ingestion idempotency key: connector + scope + external ID + revision/hash + pipeline version. A pipeline-version change may re-extract, but it must reuse the source revision and apply candidate deduplication. Do not duplicate a fact because an event was retried.

Webhooks/events provide prompt updates; reconciliation detects missed events. An absent item in an incomplete source listing is not evidence of deletion. Permission loss, API error, deletion and source correction are distinct events.

## Ticket extraction

Preserve descriptions, comment authors/timestamps, status history, decision links, acceptance criteria, due dates and project-specific field mapping. Discover configurable field IDs and workflow mappings; do not hardcode an organization's custom fields into shared logic.

Represent "ticket is Done" as a source status observation. Represent "feature is released" only with permitted deployment evidence. Keep proposals, questions and explicit approvals separate. A comment's recency does not prove author authority.

## Email extraction

Process messages individually with immutable message IDs, thread context, timestamps and quote boundaries. The same original decision quoted in multiple replies is one underlying evidence source, not multiple independent confirmations. Preserve language of conditions, uncertainty, exceptions and proposed versus approved wording.

A forwarded message is not proof that the forwarder approved its contents. Attachment access is checked separately. Extract only minimal permitted content; do not retain entire personal mailboxes to support a single business fact.

## Code and test extraction

Use commit-pinned file paths, symbol names, line spans and content hashes. Lines are meaningful only with a source revision. Prefer parser-based structure where supported; uncertain parser/model output remains a candidate. Separate implementation observation from business intent.

Code is untrusted input. Do not run imported scripts, install repository dependencies, open unsafe archives or execute tests just because a source asks you to. Executing code requires an isolated, explicitly authorized task. A test passing in a sandbox does not prove deployment.

Deployment evidence includes environment, artifact/commit identity, execution result and time. A release claim must connect the relevant implementation to the environment, not merely cite a merged PR.

## Atomic claim extraction

For each candidate preserve subject, predicate, value, conditions, exceptions, time, epistemic type, source spans and authority basis. Do not strip negatives, customer tiers, thresholds or exclusions during summarization. Split unrelated assertions rather than approving a paragraph as one fact.

Use a deterministic schema validator after extraction. Malformed/unsupported content enters quarantine with a reason; it never falls back to unchecked free text. Claim confidence helps prioritize review, not bypass it.

## Change and conflict policy

Exact duplicate: reuse the scoped candidate or link provenance without creating a second review. New supporting evidence: create a new revision when the review-bound evidence set changes. Contradiction: create a conflict set; material contradictions suspend affected serving content until resolved. Fresh proposed business intent alone is not automatically a contradiction to the current approved rule.

Source deletion/restriction: immediately advance eligibility generation, then assess surviving evidence and follow [lifecycle](lifecycle-and-cleanup.md). Do not assume every derived claim must be physically deleted if independently valid evidence remains; do not keep serving before that assessment succeeds.

## Review readiness

A candidate is ready only when required fields, exact source spans, scope, validity and authority evidence are present, and no blocking uncertainty remains. Otherwise use [CLARIFICATION_REQUEST](review-inbox-and-notes.md#clarification-contract). Source extraction cannot directly call the approval endpoint.
