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

User scope, 2026-10-07: provide a web UI with Astryx, access management, Jira/GitHub/LLM/email configuration, Docker packaging and MCP access for Codex/OpenCode. React/TypeScript is the frontend choice; the Hindsight/Hermes integration milestone remains; all TruthBase application code uses TypeScript on Node.js. Connection setup/probes are included; live source ingestion still needs source authorization. This extends the synthetic milestone without enabling procedural learning or destructive cleanup. Canonical contracts: [web administration](../spec.md#web-administration), [connections](../integrations.md#connection-configuration), [MCP](../api.md#independent-mcp-clients), [deployment](../lifecycle.md#docker-deployment).

## ADR-16: one TypeScript monorepo

User request, 2026-10-07: organize the implementation as a monorepo. Use `apps`, `packages` and `infra` with inward dependencies and one pnpm workspace and lockfile for TruthBase. The [layout](../spec.md#monorepo-layout) owns package boundaries and tooling rules; M00 owns executable scaffolding. Keep docs and progress authority unchanged. Split packages or add build orchestration only for a demonstrated boundary or build constraint.

## ADR-17: Markdown content with a transactional control ledger

User decision, 2026-10-07: keep knowledge content in Markdown for direct inspection and portability; retain a small database for review state, permissions and revocation. This replaces the earlier all-in-PostgreSQL content-storage description. “Small” describes responsibility, not a measured capacity claim. File content and database control state have separate authority; neither is a synchronized second editable copy of the other. Hindsight/OpenFGA retain their own required stores.

Use immutable files registered only after durable writes, existing semantic digests plus byte hashes, and the existing transactional authority/release gates. Authorized edits create reviewed revisions. GBrain is a reference for Markdown organization/parsing, not a replacement governance engine. See [storage](../facts.md#markdown-content-storage), [commit protocol](../consistency.md#content-commit-protocol), [volume access](../access.md#content-volume-boundary) and [backup restore](../lifecycle.md#backup-restore). M03 owns persistence/crash proof; downstream tasks reuse it.

## ADR-18: TruthBase owns memory improvement and backup

User direction, 2026-10-07: memory management, continuous improvement, daily dreaming and GitHub fact backup belong to TruthBase core, using configured LLM APIs independently of Hermes. Implement recurring knowledge proposals and a private-repository content-backup capability in the synthetic milestone. Hermes remains a required client integration, not the memory orchestrator. Preserve ADR-12: automatic procedure activation and irreversible cleanup remain deferred; scheduled runs cannot approve business facts or activate their own skills.

The [maintenance contract](../lifecycle.md#core-owned-memory-maintenance) owns scheduling, budgets, lineage and evaluation. [Private backup](../lifecycle.md#private-github-content-backup) owns export policy and verified remote receipts; Git content alone cannot restore the control ledger. Actual destinations, credentials and real-data exports require the existing owner decisions. This adds product capabilities, not permission to run a real daily job or publish data now.

## ADR-19: trust-led intake and reviewable fact units

User direction, 2026-10-07: prioritize trustworthy data, attribution of every addition/change and explicit approval over autonomous bulk scanning. Choose fact boundaries that preserve a complete verifiable rule while composing into large-system domain/capability coverage. [Provenance](../facts.md#provenance-for-every-mutation), [fact boundaries](../facts.md#fact-boundaries-and-system-coverage) and [deliberate intake](../facts.md#deliberate-intake) own these rules. Raw source storage is not knowledge approval; daily improvement remains bounded proposal work. Do not optimize for fact volume or generate missing coverage as truth.

## ADR-20: graph/editor and inbound Confluence

User direction, 2026-10-07: expose facts as scoped graphs and directly readable/editable Markdown in the web console. Views share canonical identities and policies; edits create reviewed draft revisions. User selected one-way Confluence import; no writeback. The initial adapter target is Confluence Cloud REST v2, an implementation default rather than a claim about the user's deployment. [Graph/editor](../spec.md#graph-and-markdown-workspace) and [Confluence sync](../integrations.md#confluence-inbound-synchronization) own the contracts.

## ADR-21: framework-independent memory access

User direction, 2026-10-07: future Dify, Mastra and LangChain agents must consume TruthBase effectively. Keep a shared versioned MCP/HTTP context contract, scoped delegated identity and provider-independent core now; F03 adds tested framework adapters later. Context retrieval must preserve fact qualifiers, provenance and revocation boundaries without requiring answer generation. Named-framework compatibility is not claimed until pinned real-client evidence exists.

## ADR-22: reuse libraries and Orca editor patterns

User direction, 2026-10-07: reduce reinvention through established libraries and use Orca as the web Markdown render/editor reference. The [dependency baseline](../../CONTRIBUTING.md#dependency-reuse-baseline) owns selections and spike gates; [Orca evidence](../integrations.md#orca-markdown-ux-reference) owns the inspected source details. Reuse commodity mechanisms while keeping trust/state invariants in core. Released pins and actual compatibility evidence are required at implementation; editor beta support and queue/LLM candidates are not marked proven. No desktop runtime, speculative service or duplicate UI system is adopted.

## ADR-23: four LLM providers with managed models and budgets

User requirement, 2026-10-07: support at least OpenAI API, Anthropic Claude API, Gemini and DeepSeek, with web management of models and budgets. Minimum acceptance is tested text generation for each selected provider/model, not a claim that all providers support every capability. The [model catalog](../integrations.md#llm-providers-and-model-catalog), [budget admission](../lifecycle.md#budget-enforcement) and [API](../api.md#models-and-budgets-api) define scope. Prefer the verified SDK mapping over four handwritten protocol clients; TruthBase owns model policy, reservation/accounting and egress gates. No live API keys or spending are authorized by this design update.

## ADR-24: TypeScript throughout TruthBase

User decision, 2026-10-07: use strict TypeScript on Node.js for API, core, workers and React/Astryx web. A single pnpm workspace reduces cross-language contracts and tooling; external integrations do not dictate the core language. Prefer AI SDK, the official TypeScript MCP SDK and PostgreSQL-backed Node libraries under the existing contract gates. No Python application workspace or alternate backend implementation. Native components require a demonstrated need and a separate decision. The dependency baseline lives in [CONTRIBUTING](../../CONTRIBUTING.md#dependency-reuse-baseline).
