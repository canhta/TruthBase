# Synthetic Authorization Fixtures

Use these fixtures to implement E01-E08, E25, E56-E59 and E62. Expected permissions include canonical eligibility, not only policy relationships.

## Principals

| Principal | Assignment |
|---|---|
| `USR-po-atlas` | PO, Project Atlas L2-L4; explicit business-review permission for Atlas |
| `USR-exec-atlas` | C-level, Atlas L2-L4 only; no default review permission |
| `USR-dev-atlas` | Developer, Atlas L0-L4 subject to source restrictions; no approval permission |
| `USR-dev-boreal` | Developer, Project Boreal only |
| `USR-reviewer-atlas` | Atlas business reviewer; approved review packet and technical attestations, not raw code |
| `USR-publisher-atlas` | Atlas publication approver and grant manager; separate role from fact approver |
| `USR-customer-a` | Guest with one exact publication-version grant |
| `USR-customer-b` | Guest with no grants |
| `AGENT-extractor-atlas` | Atlas source-read/proposal task only |

## Objects

`FR-refund-003`: approved current Atlas fact, internal. `FR-refund-004`: pending Atlas candidate. `SRC-code-1`: Atlas restricted code permitted to the assigned developer only. `NOTE-decline-002`: reviewers-only note. `PUB-refund-001`: approved sanitized publication tied to FR-003, granted to customer A. `PUB-refund-002`: new version without approval/grant. `FR-boreal-001`: approved Boreal fact.

FR-003 is based on a business-owner source whose confidentiality policy permits the internal business audience, while direct L0 email browsing remains layer-restricted. Restricted code is not an input to that business fact. Any PO-visible technical statement must come from a separately permitted technical attestation, not from hidden code copied into an answer.

## Expected reads

| Principal | FR-003 | FR-004 ordinary query | Raw code | Reviewer note | PUB-001 | PUB-002 | Boreal fact |
|---|---|---|---|---|---|---|---|
| PO Atlas | Allow | Deny; review mode separately allowed | Deny | Allow when assigned | Only if independently granted or management-readable | Review/management only if authorized | Deny |
| C-level Atlas | Allow | Deny | Deny | Deny | Only if granted | Deny | Deny |
| Developer Atlas | Allow | Deny | Allow | Deny by default | Only if granted | Deny | Deny |
| Developer Boreal | Deny | Deny | Deny | Deny | Deny | Deny | Allow |
| Customer A | Deny direct fact access | Deny | Deny | Deny | Allow | Deny | Deny |
| Customer B | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

## Expected writes/actions

The extractor can propose and request review, never approve. The developer's source-read access does not grant approval. The PO may approve an assigned business revision only if separation-of-duties and evidence guards pass. The publisher can approve sanitized publication content but cannot thereby approve the underlying business fact. Customer A cannot grant PUB-001 to customer B.

## Boundary mutations

Remove customer A's grant while a response is being prepared: no response released after the durable revocation boundary may contain PUB-001. Create FR-005 and PUB-003: old grants remain tied to PUB-001. Change a source's restrictions: derived-content eligibility is recomputed, not merely its source link hidden. Switch Hermes from developer to guest: no existing history or prefetch is reused.

A privileged test observer may inspect logs/DB state; that capability is not part of any persona's API permission. Keep fixture administration separate from the principal under test.
