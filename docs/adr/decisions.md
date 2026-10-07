# Decisions and Open Questions

Status: proposed architecture decisions plus explicit production blockers. These are not claims of user approval beyond the stated requirements.

## Working design baseline

| ID | Decision | Rationale | Revisit trigger |
|---|---|---|---|
| ADR-01 | Keep canonical facts and workflow outside the memory engine | Approval, versioning and erasure need one authority | A proven engine offers all required semantics without lock-in |
| ADR-02 | Use Hindsight as the first replaceable memory projection backend; required for M1 by ADR-11 | Test synthesis value while retaining canonical fallback | Failed capability/quality evaluation |
| ADR-03 | Use a thin Hermes adapter, not a Hermes-owned database | Other agents must share the same governed service | Concrete missing runtime capability |
| ADR-04 | Separate review status, availability and publication | Avoid equating accepted truth with shareability | No expected change |
| ADR-05 | Require human business-rule approval by default | Prevent inference or confidence becoming policy | Narrow owner-approved deterministic observation policy only |
| ADR-06 | Scope guest grants to exact publication versions | New wording/evidence must not inherit old release permission | Explicitly designed and approved migration workflow |
| ADR-07 | Use deny-first revocation and staged grants | Cross-store updates are not atomic | A tested stronger consistency mechanism |
| ADR-08 | Keep Graphiti/Cognee out of initial runtime | Avoid multi-engine synchronization before value is demonstrated | A measured graph/code-analysis capability gap |
| ADR-09 | Use isolated runtime contexts and no sensitive streaming | Prefetch/history/partial output can bypass retrieval-only checks | Proven runtime-safe alternative |
| ADR-10 | Retain decline notes; resubmit as a new revision | Auditability and learning without rewriting history | No expected change |

## Confirmed milestone decisions

| ID | Decision | Owner/date | Rationale and affected contracts |
|---|---|---|---|
| ADR-11 | Require real Hindsight and Hermes in M1 | User, 2026-10-07 | Integration value must be proved in the first milestone; task graph, adapter gates, REQ-15/REQ-20 |
| ADR-12 | Defer procedure learning and irreversible cleanup; keep invalidation/revocation mandatory | User, 2026-10-07 | Bound the first milestone around core governance; F01/F02 retain their enabling gates, REQ-11–REQ-14 |
| ADR-13 | Block a publication when its dependency is superseded; replacement requires new approval/grants | User, 2026-10-07 | Avoid presenting an obsolete rule as current; authorization, temporal selection, E65/E69 |
| ADR-14 | Distribute TruthBase under MIT | User, 2026-10-07 | Public open-source distribution; upstream checkouts retain their own licenses and are excluded from this repository |

Q-10 is resolved by ADR-14 and the root LICENSE file.

D00 also specifies reversible implementation contracts: `gm-json-v1`, explicit immutable supersession links, mode-specific predicates, request renewal and canonical authority/release ordering. Their definitions live only in the owning contracts. These choices do not designate real business approvers, source owners or infrastructure.

## Open decisions

| ID | Decision needed | Safe synthetic default | Blocks |
|---|---|---|---|
| Q-01 | Named fact approvers and scope/authority matrix | Synthetic reviewer identities | Real business approval |
| Q-02 | Separate publication approvers and permitted customer audiences | No external grant | External sharing |
| Q-03 | Approved LLM, embedding, reranking and tracing destinations | Synthetic data only | Real-data processing |
| Q-04 | Hosting region, encryption/key ownership, backup policy | Local isolated development | Real-data deployment |
| Q-05 | Source permissions and connector accounts | Exported synthetic fixtures | Live ingestion |
| Q-06 | Retention durations, holds, deletion authority | Destructive actions disabled | Production cleanup |
| Q-07 | Identity provider and delegated agent identity | Test identities | External or shared access |
| Q-08 | Exact upstream versions, licenses and runtime compatibility | Unpinned, not claimed compatible | Integration completion |
| Q-09 | Queue reminders/escalation calendar and owners | Proposed one/three business-day settings | Operational policy commitment |
| Q-11 | Performance and cost budget on actual hardware | Proposed targets, no results | Production sizing commitment |

## Decision process

An agent may implement synthetic scaffolding using explicit safe defaults. It must not resolve a security, contractual, authority or retention question by assumption. Record the blocker and a concise decision packet, then continue independent work. Updating a design decision requires an ID, owner, date, rationale and affected requirements/tests.

Do not ask the same resolved question again. Read the current decision record first. Do not present a proposed decision as a user instruction.

## ADR-15: web console and deployable agent service

User scope, 2026-10-07: provide a web UI with Astryx, access management, Jira/GitHub/LLM/email configuration, Docker packaging and MCP access for Codex/OpenCode. React/TypeScript is the frontend choice; the Python backend and Hindsight/Hermes milestone remain. Connection setup/probes are included; live source ingestion still needs source authorization. This extends the synthetic milestone without enabling procedural learning or destructive cleanup. Canonical contracts: [web administration](../spec.md#web-administration), [connections](../integrations.md#connection-configuration), [MCP](../api.md#independent-mcp-clients), [deployment](../lifecycle.md#docker-deployment).

## ADR-16: one polyglot monorepo

User request, 2026-10-07: organize the implementation as a monorepo. Use `apps`, `packages` and `infra` with inward dependencies and one lockfile per language ecosystem. The [layout](../spec.md#monorepo-layout) owns package boundaries and tooling rules; M00 owns executable scaffolding. Keep docs and progress authority unchanged. Split packages or add build orchestration only for a demonstrated boundary or build constraint.
