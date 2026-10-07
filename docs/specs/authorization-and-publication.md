# Authorization and Publication

Status: canonical security contract. Role labels are not sufficient authorization.

## Decision model

```text
allow = authenticated_user
        AND authenticated_agent_delegation
        AND tenant_project_match
        AND action_capability
        AND layer_permission
        AND sensitivity_and_source_constraints
        AND object_relationship
        AND eligibility_for_requested_action_and_mode
        AND current_revocation_generation
```

OpenFGA supplies relationship checks; the gateway and canonical store supply scope, lifecycle and validity checks. A positive FGA relationship alone does not approve a fact or establish source validity. Official object/group modeling is referenced in [S09-S10](upstream-evidence.md).

Never trust caller-supplied `role`, `tenant_id`, `bank_id`, `allow_all`, policy model ID or worker identity as credentials. The gateway derives effective scope from authenticated identity and delegation, validating any requested narrowing scope.

## Persona defaults

| Persona | Read | Explicitly not implied |
|---|---|---|
| PO / C-level | L2-L4 of granted projects | Raw L0/L1, all-company access, approval or publication rights |
| Developer | L0-L4 of granted projects, subject to source/sensitivity constraints | Other projects, secrets, approval, grant administration or deletion |
| Guest/customer | Exact approved publication-version objects with active grants | Internal facts, sources, notes, graph neighbors, future versions |
| Fact reviewer | Review queue and permitted packet for assigned scope | Reading otherwise inaccessible code/email; publishing externally |
| Publication reviewer | Sanitized payload, dependency eligibility and shareability attestation | Altering business truth or granting themselves access |
| Agent worker | Narrow task-scoped capability | Human approval, privilege escalation or policy-model administration |

Potential capabilities: `read_fact`, `read_history`, `read_source`, `read_implementation`, `read_business`, `read_progress`, `read_review`, `propose_fact`, `request_review`, `respond_clarification`, `approve_fact`, `manage_review`, `approve_publication`, `grant_publication`, `revoke_publication`, `suspend_content`, `approve_cleanup`, `execute_cleanup`, `approve_skill`.

## Source restrictions versus layer browsing

Propagate source confidentiality, audience and processing restrictions; do not confuse them with the separate right to browse the raw L0 container. A PO may read a reviewed L2 claim derived under an approved internal audience policy without receiving permission to browse the entire email or repository. The answering model receives that permitted L2 claim, not the raw source.

If a source's audience restrictions exclude the PO, extraction or fact approval alone cannot widen access. Use a separately reviewed sanitized release with a documented source-owner policy basis. The publication mechanism can also target an internal audience for this purpose; it does not expose raw lineage. Fixtures must explicitly distinguish an internal-audience source with restricted L0 browsing from a source whose content itself is restricted to developers.

## Permission boundaries through retrieval

Authorize candidates before any content reaches the answering model, reranker or non-trusted service. Trusted retrieval infrastructure may handle indexes under explicitly approved service privileges, but any external model input still obeys the user's effective scope and data-processing policy.

Filter source previews, graph traversal, citations, trace output, filenames, result counts and aggregates. Partition caches by tenant, project, principal/effective grants, action, time mode, policy version and revocation generation. Cache sharing is allowed only after proven identical authorization and content eligibility, not merely matching role names.

A summary may be served only if its full dependency manifest is valid and every input was permitted for that audience. Declassification requires a separately reviewed publication. No "summary is harmless" shortcut.

## Guest publication workflow

```text
Eligible approved fact revision
        -> draft sanitized Publication version
        -> publication approval with required note
        -> exact-version audience grant
        -> guest read through publication-only endpoint
```

Publication approval and grant creation are separate auditable operations, though a UI can orchestrate them. Granting access never approves a draft. Approval binds content digest, exact dependencies, sanitized citations, target audience and publication policy.

A publication's content is immutable. A new fact revision or wording change creates a new publication version and new approval. Existing grants do not automatically target "latest". A future feature can propose migration, but a human must authorize the new content version; keep automatic migration disabled.

Guest access may refer to an explicitly identified customer group. Group membership changes are authorization changes with revocation handling. Guests must not enumerate internal fact IDs via publication metadata. Internal lineage remains stored but is not included in their response.

## Revocation and concurrency

Canonical deny/tombstone checks are the serving authority. For revocation, first commit the blocking state and increment the relevant generation; then propagate relation removal, invalidation and cache cleanup. Return a revocation acknowledgement only after the canonical barrier is durable.

For grants, do the reverse for safety: pending grants are denied until all required canonical and authorization writes are confirmed. Use an outbox/saga and a reconciliation worker; never describe cross-store writes as a single atomic transaction.

Recheck eligibility and authorization immediately before emitting a response. Disable streaming sensitive factual responses in the pilot so validation can occur before release. After a revocation, terminate affected conversations and rebuild context from allowed data; changing the next retrieval filter cannot remove already loaded model context. Already delivered text cannot be recalled.

FGA consistency modes are upstream features, not a universal read-after-write guarantee across this architecture. Pin the authorization model, select appropriate consistency options and test them together with the canonical barrier [S11](upstream-evidence.md).

## Database defense in depth

Use tenant/project row guards and separate database roles. PostgreSQL superusers and `BYPASSRLS` roles bypass row security; owners usually do unless forced [S12](upstream-evidence.md). Runtime roles must not have those bypass privileges. Test connection-pool identity reset, background jobs and security-definer paths. RLS on canonical tables does not automatically protect a memory engine's internal store.

## Denial behavior

Unknown or unauthorized object IDs return the same `404 NOT_FOUND` shape to unprivileged callers. When object visibility is already established but an action is forbidden, `403 FORBIDDEN` is allowed. Missing validated scope returns a non-revealing policy error and never broadens retrieval. Policy-service failure returns a retryable error, not a permissive fallback.

## Publication eligibility

A publication read requires its own approved status, active exact-version grant, permitted audience, current release basis and dependency validity. Dependency checks are internal service checks: exact approved revisions/digests, acceptable evidence, no suspension/retraction/erasure/conflict, and current effective selection. They do not require a guest to possess internal `read_fact` or `read_source` permission.

When a successor becomes effective, a publication depending on the predecessor becomes ineligible immediately through query-time temporal selection. Its approval remains historical; a new publication needs new approval and grants. Existing grants do not migrate. A future-effective dependency cannot support a currently served publication. First-milestone publications have no historical-read exception.

A sanitized release requires a ReleaseBasis tied to an existing source-owner policy and its issuer, version, input scope, permitted transformation and audience. `approve_publication` alone cannot manufacture this authority. The publication reviewer must be allowed to inspect the proposed sanitized payload and the necessary attestations. If that basis is missing or no longer valid, approval/read fails closed. A source restriction invalidates the basis until revalidated under the new generation; it cannot be bypassed by an old declassification decision. Named real source owners remain Q-02/Q-05 decisions; the pilot uses explicit synthetic policy fixtures.

## Publication transitions

| From | Action | To | Required guards |
|---|---|---|---|
| `draft` | Submit | `pending_approval` | Exact immutable payload/dependencies/audience, valid release basis, request and note |
| `pending_approval` | Approve | `approved` | `approve_publication`, current digests/policy/authority generation, separation of duties, unexpired request and note |
| `pending_approval` | Decline | `declined` | `approve_publication`, current request/version and reason note |
| `approved` | Revoke | `revoked` | `revoke_publication`, expected publication version, note and durable denial barrier |

All other transitions are rejected. Content/audience/dependency edits and appeals create a new publication ID linked by `replaces_publication_id`; declined and revoked versions never reopen. Publication approval cannot create a grant. Grant/revoke-grant operations require `grant_publication`, expected versions, notes and the [staged-grant/deny-first protocol](events-and-consistency.md#cross-store-authorization-saga). Grant states are defined in the domain model. A revoked grant is terminal; a new grant uses a new ID and rechecks current eligibility.

Request expiry/reassignment/renewal uses the same request-lifecycle rules as fact review, without changing publication review status. Publication requests admit approve/decline only; questions are notes, and any changed release payload starts a new publication. Ordinary agents have none of these approval/grant/revoke capabilities.
