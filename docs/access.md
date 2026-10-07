# Access and retrieval

## Authorization and Publication

Status: canonical security contract. Role labels are not sufficient authorization.

### Decision model

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

OpenFGA supplies relationship checks; the gateway and canonical store supply scope, lifecycle and validity checks. A positive FGA relationship alone does not approve a fact or establish source validity. Official object/group modeling is referenced in [S09-S10](integrations.md#upstream-evidence-and-verification-register).

Never trust caller-supplied `role`, `tenant_id`, `bank_id`, `allow_all`, policy model ID or worker identity as credentials. The gateway derives effective scope from authenticated identity and delegation, validating any requested narrowing scope.

### Persona defaults

| Persona | Read | Explicitly not implied |
|---|---|---|
| PO / C-level | L2-L4 of granted projects | Raw L0/L1, all-company access, approval or publication rights |
| Developer | L0-L4 of granted projects, subject to source/sensitivity constraints | Other projects, secrets, approval, grant administration or deletion |
| Guest/customer | Exact approved publication-version objects with active grants | Internal facts, sources, notes, graph neighbors, future versions |
| Fact reviewer | Review queue and permitted packet for assigned scope | Reading otherwise inaccessible code/email; publishing externally |
| Publication reviewer | Sanitized payload, dependency eligibility and shareability attestation | Altering business truth or granting themselves access |
| Agent worker | Narrow task-scoped capability | Human approval, privilege escalation or policy-model administration |

Potential capabilities: `read_fact`, `read_history`, `read_source`, `read_implementation`, `read_business`, `read_progress`, `read_review`, `propose_fact`, `request_review`, `respond_clarification`, `approve_fact`, `manage_review`, `approve_publication`, `grant_publication`, `revoke_publication`, `suspend_content`, `approve_cleanup`, `execute_cleanup`, `approve_skill`.

### Source restrictions versus layer browsing

Propagate source confidentiality, audience and processing restrictions; do not confuse them with the separate right to browse the raw L0 container. A PO may read a reviewed L2 claim derived under an approved internal audience policy without receiving permission to browse the entire email or repository. The answering model receives that permitted L2 claim, not the raw source.

If a source's audience restrictions exclude the PO, extraction or fact approval alone cannot widen access. Use a separately reviewed sanitized release with a documented source-owner policy basis. The publication mechanism can also target an internal audience for this purpose; it does not expose raw lineage. Fixtures must explicitly distinguish an internal-audience source with restricted L0 browsing from a source whose content itself is restricted to developers.

### Permission boundaries through retrieval

Authorize candidates before any content reaches the answering model, reranker or non-trusted service. Trusted retrieval infrastructure may handle indexes under explicitly approved service privileges, but any external model input still obeys the user's effective scope and data-processing policy.

Filter source previews, graph traversal, citations, trace output, filenames, result counts and aggregates. Partition caches by tenant, project, principal/effective grants, action, time mode, policy version and revocation generation. Cache sharing is allowed only after proven identical authorization and content eligibility, not merely matching role names.

A summary may be served only if its full dependency manifest is valid and every input was permitted for that audience. Declassification requires a separately reviewed publication. No "summary is harmless" shortcut.

### Guest publication workflow

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

### Revocation and concurrency

Canonical deny/tombstone checks are the serving authority. For revocation, first commit the blocking state and increment the relevant generation; then propagate relation removal, invalidation and cache cleanup. Return a revocation acknowledgement only after the canonical barrier is durable.

For grants, do the reverse for safety: pending grants are denied until all required canonical and authorization writes are confirmed. Use an outbox/saga and a reconciliation worker; never describe cross-store writes as a single atomic transaction.

Recheck eligibility and authorization immediately before emitting a response. Disable streaming sensitive factual responses in the pilot so validation can occur before release. After a revocation, terminate affected conversations and rebuild context from allowed data; changing the next retrieval filter cannot remove already loaded model context. Already delivered text cannot be recalled.

FGA consistency modes are upstream features, not a universal read-after-write guarantee across this architecture. Pin the authorization model, select appropriate consistency options and test them together with the canonical barrier [S11](integrations.md#upstream-evidence-and-verification-register).

### Database defense in depth

Use tenant/project row guards and separate database roles. PostgreSQL superusers and `BYPASSRLS` roles bypass row security; owners usually do unless forced [S12](integrations.md#upstream-evidence-and-verification-register). Runtime roles must not have those bypass privileges. Test connection-pool identity reset, background jobs and security-definer paths. RLS on canonical tables does not automatically protect a memory engine's internal store.

### Denial behavior

Unknown or unauthorized object IDs return the same `404 NOT_FOUND` shape to unprivileged callers. When object visibility is already established but an action is forbidden, `403 FORBIDDEN` is allowed. Missing validated scope returns a non-revealing policy error and never broadens retrieval. Policy-service failure returns a retryable error, not a permissive fallback.

### Publication eligibility

A publication read requires its own approved status, active exact-version grant, permitted audience, current release basis and dependency validity. Dependency checks are internal service checks: exact approved revisions/digests, acceptable evidence, no suspension/retraction/erasure/conflict, and current effective selection. They do not require a guest to possess internal `read_fact` or `read_source` permission.

When a successor becomes effective, a publication depending on the predecessor becomes ineligible immediately through query-time temporal selection. Its approval remains historical; a new publication needs new approval and grants. Existing grants do not migrate. A future-effective dependency cannot support a currently served publication. First-milestone publications have no historical-read exception.

A sanitized release requires a ReleaseBasis tied to an existing source-owner policy and its issuer, version, input scope, permitted transformation and audience. `approve_publication` alone cannot manufacture this authority. The publication reviewer must be allowed to inspect the proposed sanitized payload and the necessary attestations. If that basis is missing or no longer valid, approval/read fails closed. A source restriction invalidates the basis until revalidated under the new generation; it cannot be bypassed by an old declassification decision. Named real source owners remain Q-02/Q-05 decisions; the pilot uses explicit synthetic policy fixtures.

### Publication transitions

| From | Action | To | Required guards |
|---|---|---|---|
| `draft` | Submit | `pending_approval` | Exact immutable payload/dependencies/audience, valid release basis, request and note |
| `pending_approval` | Approve | `approved` | `approve_publication`, current digests/policy/authority generation, separation of duties, unexpired request and note |
| `pending_approval` | Decline | `declined` | `approve_publication`, current request/version and reason note |
| `approved` | Revoke | `revoked` | `revoke_publication`, expected publication version, note and durable denial barrier |

All other transitions are rejected. Content/audience/dependency edits and appeals create a new publication ID linked by `replaces_publication_id`; declined and revoked versions never reopen. Publication approval cannot create a grant. Grant/revoke-grant operations require `grant_publication`, expected versions, notes and the [staged-grant/deny-first protocol](consistency.md#cross-store-authorization-saga). Grant states are defined in the domain model. A revoked grant is terminal; a new grant uses a new ID and rechecks current eligibility.

Request expiry/reassignment/renewal uses the same request-lifecycle rules as fact review, without changing publication review status. Publication requests admit approve/decline only; questions are notes, and any changed release payload starts a new publication. Ordinary agents have none of these approval/grant/revoke capabilities.

## Retrieval and Answer Contract

Status: normative serving pipeline. Related: [authorization](access.md#authorization-and-publication), [Hindsight adapter](integrations.md#hindsight-adapter).

### Retrieval modes

| Mode | Audience | Eligible content |
|---|---|---|
| `current` | Authorized internal users | Current approved facts and valid scoped derivatives |
| `history` | Users with explicit history permission | Time-qualified approved historical revisions, subject to current restrictions |
| `review` | Authorized reviewers only | Candidates, notes and evidence in assigned review context, clearly labeled |
| `publication` | Guests and permitted internal viewers | Exact granted publication versions only |

Never blend review candidates into current answers. A reviewer can examine a declined proposal without causing it to enter general memory context. Guests cannot select `review` or `history` to bypass publication-only access.

### Mode-specific eligibility

| Mode | Required predicate | Content boundary |
|---|---|---|
| `current` | Approved dependency validity + current effective selection + caller/delegation read access + current generations | Approved facts and permitted derivatives only |
| `history` | Approved historical revision + requested valid/recorded time + history access + current evidence/access/tombstone checks | Superseded/archived content only where retention permits; never suspended, purge-pending or purged content |
| `review` | Assigned/scoped review access + target/note/evidence audience checks + current access/tombstone checks | Draft, unclear, pending, declined, withdrawn and approved revisions may be inspected with their exact status; review content never enters serving projections |
| `publication` | Approved publication + active exact-version grant + current dependencies + valid release basis + current generations | Only the immutable sanitized publication payload and approved public citations |

A guest's inability to read an internal dependency is not itself publication invalidity. The release basis authorizes the narrower published content; it does not grant raw-source access. Internal dependency IDs stay internal. Publications stop serving on dependency supersession as specified in [publication](access.md#publication-eligibility).

Review responses identify the exact revision/status and authorized notes; they do not label candidate assertions as approved facts. History selection reconstructs recorded state at the requested time but always overlays present access/retraction/erasure barriers. Unknown modes fail schema validation.

### Serving sequence

1. Authenticate user, agent and delegation. Validate non-empty tenant/project scope.
2. Resolve action/layer/object permissions and capture current policy/eligibility generations.
3. Retrieve IDs and permitted candidate content from canonical storage or a certified audience-sealed backend partition. Apply permissions before any unauthorized content reaches a model.
4. Resolve results to exact canonical objects and apply the selected mode predicate above. Unapproved content is permitted only inside an authorized review response. Future-effective content is excluded from current mode; history uses the explicitly requested time.
5. Build a minimal context bundle with allowed facts, explicit uncertainty, safe citations and observation timestamps.
6. Generate a structured response using only that bundle, or return a deterministic fact/publication response.
7. Validate claim support and citations; recheck generation and authorization before emitting. On change, discard and rebuild or fail safely.
8. Record an access-controlled answer receipt with IDs, versions, model/prompt versions and policy decision references, not unrestricted copies of source text.

No raw backend trace, graph neighbor expansion or model-produced citation is trusted. Unresolvable citations fail validation. Do not cite a document title or locator the user cannot read.

### Response shape

```json
{
  "answer_id": "ANS-demo-001",
  "mode": "current",
  "status": "answered",
  "answer": "The approved premium-plan refund window is 30 days. Deployment is not yet established by the available evidence.",
  "claims": [
    {
      "text": "The approved premium-plan refund window is 30 days.",
      "fact_revision_ids": ["FR-refund-003"],
      "epistemic_type": "approved_intent"
    }
  ],
  "citations": [{"label": "Approved refund rule", "resource_id": "FR-refund-003"}],
  "as_of_valid_time": "2026-10-07T02:00:00Z",
  "warnings": ["deployment_not_verified"]
}
```

This is an illustrative platform response, not an upstream API. `status` is `answered`, `insufficient_evidence`, `needs_clarification`, or `temporarily_unavailable`. Hidden resource IDs, review requests and unsupported detail are omitted for unauthorized users.

### Unknown or unapproved information

Say what cannot be established without implying hidden content exists. Example: "I do not have an approved fact available for that question." An authorized internal user may receive a link to an existing clarification request. Opening a new request is a separate authorized action, not a silent side effect of every search.

Where partial answers are safe, provide supported facts and explicitly bound the unknown. Do not infer deployment from Done status, ownership from a mention, approval from a comment or truth from a model-generated summary.

### Progress and aggregate views

Compute numerical metrics from versioned structured facts and explicit formulas. Store denominator, source coverage, observation time and freshness deadline. Summarization explains calculations; it does not fabricate percentages or missing statuses.

Aggregates can reveal excluded data. Build them from the viewer's allowed inputs or from a separately approved sanitized publication. Do not show hidden-project counts or "three blocked items you cannot access".

### Context budget and caching

Load task-relevant rules and their necessary exceptions, not every remembered fact. Preserve qualifications before aggressively shortening context. Use token budgets as configurable limits and measure answer quality when reducing them.

Invalidate query results, prefetch bundles, derived summaries, response caches and persistent conversation context on relevant permission or evidence changes. Disable sensitive response streaming in the pilot. A final checker cannot undo a disallowed sentence already streamed.

### Backend fallback

If Hindsight is unavailable, use authorized canonical full-text retrieval and return a bounded answer. If authorization or canonical eligibility is unavailable, do not fall back to an old memory dump. If lineage cannot be verified, exclude that result. Safe failure is preferred to a confident unsupported answer.

## Security and Threat Model

Status: required design and test checklist. This is an engineering specification, not a certification or legal-compliance claim.

### Protected assets

Client code, email, business rules, review notes, credentials, source permissions, customer publications, learned procedures, audit records, conversation history and model-provider payloads. Treat indexes, embeddings, caches and logs as potentially sensitive derivatives.

### Threats and controls

| Threat | Required control | Test |
|---|---|---|
| Prompt injection in a ticket/email/code comment | Treat input as data; fixed tool capabilities; no source-driven approvals or tool installation | E49-E50 |
| Cross-project leakage | Validated scope, object checks, DB guards and isolated partitions | E01-E05 |
| Summary or graph-traversal leakage | Authorized input construction and full dependency checks | E24, E56 |
| Guessed fact/publication IDs | Non-enumerable scoped reads; indistinguishable not-found response | E59 |
| Approval replay or stale review | Digests, policy version, optimistic concurrency and idempotency | E18-E20, E43 |
| Confused-deputy worker | Intersection of delegated permissions; different credentials by task | E41 |
| Stored agent-output poisoning | Derivative provenance; no self-corroboration | E35-E37 |
| Local memory/session leakage | Isolated Hermes homes, no guest local history tools, context invalidation | E40-E42 |
| Permission change during answer | Canonical revocation barrier and final validation; no sensitive streaming | E29, E57 |
| Unsafe maintenance | Dry-run, plan-bound approval, no arbitrary SQL, generation guards | E32-E34 |
| External processor leakage | Approved destinations for LLM, embeddings, reranking, traces and errors | E48 |
| Supply-chain compromise | Pinned versions, license/dependency review and isolated execution | E53-E54 |

### Identity and privileges

Use short-lived delegated tokens where feasible. No shared global admin token in agent configuration. Keep OpenFGA administration, migrations, cleanup execution and source ingestion credentials separate. Administrative support access must be time-bounded, explicit and audited; it is not automatically conversational access to every customer's data.

Protect against horizontal access escalation on all endpoints, including notes, jobs, audit events and exports. Validate scope inside the transaction, not only in the UI. Connection pool state must not carry tenant identity across requests.

### Source execution and network policy

Do not execute imported repository code or attachments during ordinary ingestion. Sandbox explicitly authorized execution with restricted filesystem, network and credentials. Block implicit dependency installation from retrieved instructions. Limit outbound destinations and payloads; self-hosting one component does not authorize third-party model processing.

Credentials discovered in a source are restricted incident content, not useful reusable memory. Redact or isolate them and notify the authorized owner. Do not copy secrets into notes, evaluation fixtures, prompts or examples.

### Logging and auditing

Log opaque object IDs, policy outcomes, versions, latency and error categories. Avoid full prompts and source text in standard telemetry. Restricted debug capture must be explicit, time-limited and governed by retention. A reviewer note has its own access policy; operational logs must not reproduce it.

Audit approval, decline, clarification, grants, publication, suspension, cleanup, skill activation and administrative overrides. Tamper evidence should protect decision integrity without making required content redaction impossible.

### Revocation limits

Block future serving immediately at the defined acknowledgement boundary. Terminate affected active contexts and invalidate derivatives. Record externally delivered data that cannot be recalled. Do not claim erasure from a model provider, backup or user's downloaded file without a verified mechanism.

### Release gate

No real client data until exact dependency versions, approved model endpoints, source permissions, reviewer roles and deletion/retention ownership are recorded. All security-critical tests for enabled paths and denial tests for disabled paths must pass, following the [milestone gates](evaluation.md#hard-release-gates). A demonstration with synthetic data is not a completed production security review.

## Synthetic Authorization Fixtures

Use these fixtures to implement E01-E08, E25, E56-E59 and E62. Expected permissions include canonical eligibility, not only policy relationships.

### Principals

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

### Objects

`FR-refund-003`: approved current Atlas fact, internal. `FR-refund-004`: pending Atlas candidate. `SRC-code-1`: Atlas restricted code permitted to the assigned developer only. `NOTE-decline-002`: reviewers-only note. `PUB-refund-001`: approved sanitized publication tied to FR-003, granted to customer A. `PUB-refund-002`: new version without approval/grant. `FR-boreal-001`: approved Boreal fact.

FR-003 is based on a business-owner source whose confidentiality policy permits the internal business audience, while direct L0 email browsing remains layer-restricted. Restricted code is not an input to that business fact. Any PO-visible technical statement must come from a separately permitted technical attestation, not from hidden code copied into an answer.

### Expected reads

| Principal | FR-003 | FR-004 ordinary query | Raw code | Reviewer note | PUB-001 | PUB-002 | Boreal fact |
|---|---|---|---|---|---|---|---|
| PO Atlas | Allow | Deny; review mode separately allowed | Deny | Allow when assigned | Only if independently granted or management-readable | Review/management only if authorized | Deny |
| C-level Atlas | Allow | Deny | Deny | Deny | Only if granted | Deny | Deny |
| Developer Atlas | Allow | Deny | Allow | Deny by default | Only if granted | Deny | Deny |
| Developer Boreal | Deny | Deny | Deny | Deny | Deny | Deny | Allow |
| Customer A | Deny direct fact access | Deny | Deny | Deny | Allow | Deny | Deny |
| Customer B | Deny | Deny | Deny | Deny | Deny | Deny | Deny |

### Expected writes/actions

The extractor can propose and request review, never approve. The developer's source-read access does not grant approval. The PO may approve an assigned business revision only if separation-of-duties and evidence guards pass. The publisher can approve sanitized publication content but cannot thereby approve the underlying business fact. Customer A cannot grant PUB-001 to customer B.

### Boundary mutations

Remove customer A's grant while a response is being prepared: no response released after the durable revocation boundary may contain PUB-001. Create FR-005 and PUB-003: old grants remain tied to PUB-001. Change a source's restrictions: derived-content eligibility is recomputed, not merely its source link hidden. Switch Hermes from developer to guest: no existing history or prefetch is reused.

A privileged test observer may inspect logs/DB state; that capability is not part of any persona's API permission. Keep fixture administration separate from the principal under test.

## Administration boundary

Access administration, connection management and agent-credential management are separate scoped capabilities: `manage_access`, `manage_connections`, and `manage_agent_credentials`. They do not imply fact approval, publication approval, source access or permission to export content. Administrators cannot grant capabilities outside their delegated ceiling or use a connection's service account to widen their own read scope. Changes require an expected version, idempotency key and durable audit event; grants and revocations use the existing authority/release ordering.

Server responses expose only permitted principals, resource references and sanitized connection metadata. Credential values are write-only and never returned in lists, details, validation errors, logs or audit diffs. UI hiding, disabled buttons and MCP tool discovery never replace server authorization. Revoked agent credentials are checked before each request and final release; long-lived sessions do not preserve revoked authority.
