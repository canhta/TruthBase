# Glossary

| Term | Meaning in this project |
|---|---|
| Harness | Instructions, contracts, GitHub issues, examples and verification gates that guide an implementation agent |
| Candidate | A proposed claim that has not passed required review |
| Fact | Stable identity for a claim family; individual revisions carry content and approval |
| Approved fact | An exact reviewed revision that may still be future-effective, suspended or inaccessible |
| Clarification | A request to resolve a blocking ambiguity; not approval or decline |
| Declined | A rejected proposed revision with a required note; not a proof of the inverse statement |
| Revision | Immutable claim/evidence payload version with separate lifecycle events |
| Availability | Lifecycle state controlling whether otherwise approved content may be served |
| Eligibility | Combined approval, validity, evidence, conflict, lifecycle and permission checks |
| Publication | Separately reviewed immutable shareable content tied to exact approved inputs |
| Declassification | Explicit authorized release of narrower sanitized information from restricted inputs |
| Evidence | Source-version-bound material or scoped authority attestation supporting a claim |
| Lineage | Recorded derivation from all inputs through facts, summaries, skills and publications |
| Content store | Immutable Markdown knowledge payloads and protected original attachments; no approval or access authority |
| Control ledger | Transactional references, decisions, permissions, generations and delivery state; cannot be rebuilt from content alone |
| Projection | Rebuildable search/memory/view representation, not the canonical truth ledger |
| Episode | A scoped record of an interaction and outcome, not automatically verified knowledge |
| Skill | Versioned procedure with permissions, evaluation and activation controls |
| Policy version | The exact authorization or review policy used for an operation |
| Delegation | A task-scoped agent authority that cannot exceed the user's effective permissions |
| Outbox | Events recorded in the same transaction as canonical changes, delivered afterward |
| Tombstone | Minimal retained marker preventing deleted/revoked content from being resurrected |
| Generation | Monotonic version used to invalidate stale permissions, views or caches |
| Fail closed | Deny or pause when permission or validity cannot be established |
| Valid time | When a claim applies to the business world |
| Recorded time | When the platform knew or recorded a claim or decision |
| Serving boundary | The enforced point where permitted context or answers can leave the service |

Use "business", "approval", "declined" and "agent" in schema and file names. Avoid introducing misspelled aliases into contracts.
