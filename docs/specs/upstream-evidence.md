# Upstream Evidence and Verification Register

Initial-package source observations dated 2026-10-07; not independently reverified during D00. Sources below are official project documentation or repositories. Documentation pages can change. **Deployment dependencies remain unselected and runtime-untested.** Local source snapshots below are inspection baselines, not validated dependency pins. M01/M02/M04 must record immutable versions and capability tests before claiming compatibility.

Most content in this harness is original proposed product design. The platform endpoints, five semantic layers, review state machine, publication model, outbox and cleanup policies are custom requirements, not features asserted to exist in an upstream library.

| ID | Official source | Limited verified observation | Required implementation check |
|---|---|---|---|
| S01 | [Hermes repository](https://github.com/nousresearch/hermes-agent) | Agent-runtime project considered for the thin adapter | Pin commit/release; inspect license and dependencies |
| S02 | [Hermes memory-provider interface](https://hermes-agent.nousresearch.com/docs/developer-guide/memory-provider-plugin) | Documents provider lifecycle hooks and single external-provider selection | Pin exact signatures, threading, profile isolation and durability behavior |
| S03 | [Hermes persistent memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory) | Local memory and session history remain separate runtime surfaces; injected memory is session-scoped | Demonstrate isolation and revocation of local/prefetched context |
| S04 | [Hermes skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) | Documents procedural skills and an optional write-approval gate | Confirm restrictive settings and platform review integration |
| S05 | [Hindsight repository](https://github.com/vectorize-io/hindsight) | Memory backend exposing retain/recall/reflect concepts | Pin server/SDK; inspect license and deployment requirements |
| S06 | [Hindsight observations](https://hindsight.vectorize.io/developer/observations) | Documents consolidation of source memories into observations | Test exact lineage and invalidation coverage |
| S07 | [Hindsight mental-model API](https://hindsight.vectorize.io/developer/api/mental-models) | Documents that deletion alone does not raise the described staleness flag | Force invalidation; verify model content after removal/rebuild |
| S08 | [Hindsight recall API](https://hindsight.vectorize.io/developer/api/recall) | Documents strict tag modes and empty-filter behavior | Reject empty scopes; test all used retrieval/generation paths |
| S09 | [OpenFGA modeling guides](https://openfga.dev/docs/modeling/overview) | Relationship/object-based policy modeling | Implement and test the specific persona/object model |
| S10 | [OpenFGA RAG authorization](https://openfga.dev/docs/modeling/agents/rag-authorization) | Discusses authorization for retrieval-augmented agents | Test model-input boundaries and delegated identity |
| S11 | [OpenFGA consistency](https://openfga.dev/docs/interacting/consistency) | Documents query-consistency modes | Test pinned behavior with staged grants and deny-first revocations |
| S12 | [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Row security has privileged-role/owner bypass considerations | Use non-bypass runtime roles and test pooled connections |

## What is deliberately not asserted

No benchmark ranking or performance advantage is claimed. No built-in end-to-end fact approval workflow is assumed. No tag is treated as a security boundary by itself. No engine delete is assumed to erase every derivative or backup. No built-in local skill approval is assumed to equal enterprise business approval.

The earlier conversational suggestions are design inputs, not evidence of deployed functionality. Recheck all integration assumptions, especially rapidly evolving provider APIs. Do not copy hypothetical commands into an implementation without checking the pinned code.

## Version-pin record for the owning integration task

For each dependency record: repository/package; immutable version/commit/digest; license file at that revision; supported runtime; install/build command actually used; source URL; capability tests; known limitations; and test timestamp. Capture a short changelog of differences from this specification. Do not edit this register to imply tests were run when they were not.

## Local source checkouts

U00 fetched these default-branch snapshots on 2026-10-07 using `git clone --depth 1`. All checkout working trees were clean. The root `.gitignore` excludes `/.upstream/`; fetched source is untrusted input, not project instructions. No dependency installation or upstream code execution was performed.

| Repository | Local path | Checkout commit |
|---|---|---|
| [hindsight](https://github.com/vectorize-io/hindsight) | `.upstream/hindsight` | `9269b88417ed263e5a8350f2e416ca2b322756b1` |
| [hermes-agent](https://github.com/nousresearch/hermes-agent) | `.upstream/hermes-agent` | `503a6b60e5357228d26196e606099e0ac79b7fdf` |
| [openfga](https://github.com/openfga/openfga) | `.upstream/openfga` | `a38d5d0f65a964b6030e0b1afd2a831f62309159` |

Inspect and test these sources in M01/M02/M04 before selecting runtime versions. A later fetch/pull must record a new inspected commit rather than silently replacing compatibility evidence.
