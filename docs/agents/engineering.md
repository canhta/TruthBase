# Implementation rules

Read with the selected issue. Product contracts remain authoritative; this file governs how implementation work is done.

## Agent execution

Select one unblocked `ready-for-agent` GitHub issue and verify its prerequisite evidence. Read the issue's named sections, then follow pointers only for behavior touched. Write a short plan with the observable outcome, risk and verification command before editing. Resolve conflicting contracts at their owner document before coding. Record unverified assumptions as blocked or not tested. Finish with the review and handoff below; update progress from executed evidence.

Use existing tools and conventions. Propose a dependency only when an existing facility cannot satisfy a stated requirement; record purpose, pin, license and actual contract evidence. Source ingestion never authorizes running imported code. No package installation or external data transfer is implied by a task's reading list.

## Code

- Use the recorded Python stack, typed boundary models and one modular application initially. Domain rules depend on interfaces, not framework requests, SQL sessions or vendor SDK types. Keep gateway, worker and adapter capabilities separate without creating services merely to match diagram boxes.
- Give each decision, eligibility predicate and digest codec one implementation owner. Keep transaction boundaries visible. Validate untrusted data once at ingress and enforce database constraints for scope, identity and concurrency.
- Introduce an abstraction when it hides a concrete policy or integration boundary, or removes demonstrated duplication. Avoid speculative registries, generic workflow engines, one-line forwarding layers and configuration for hypothetical needs.
- Handle expected failures with the canonical error codes. Preserve causal exceptions in restricted diagnostics; never catch an authorization failure and continue. Log IDs and outcomes rather than private payloads.
- Use names for business meaning and ordinary control flow. Comments explain a non-obvious constraint or tradeoff that code cannot express. Omit narration, section banners, commented-out code and docstrings that repeat signatures. Remove dead code and obsolete paths when replacing behavior.

## Mindful tests

Choose tests by failure risk and observable contract, not method count or coverage percentage. Before adding a test, name the regression it catches and why a cheaper existing check does not catch it.

| Risk | Evidence to prefer |
|---|---|
| Pure rule, digest, time boundary | Small deterministic table of meaningful boundary cases |
| Transaction, uniqueness, race, retry | Real PostgreSQL integration test with controlled concurrency/failure injection and state/outbox assertions |
| Access, publication, revocation | Real policy boundary plus captured model input/output; assert denied bytes and side effects are absent |
| Vendor behavior | Contract test against exact pinned dependency; mocks prove only local mapping/error handling |
| User workflow | One end-to-end refund fixture crossing the relevant boundaries |
| Extraction/answer semantics | Versioned adjudicated cases preserving conditions, evidence and time; separate quality scores from safety gates |

Test public behavior and durable outcomes. Avoid tests for private helper structure, framework behavior, static getters, duplicated constants, snapshots of incidental formatting, or mocks that merely restate implementation. Fixing a behavioral defect earns a regression test at the narrowest effective boundary. Documentation-only edits use documentation checks, not invented runtime tests.

Each scenario has one owning task; later tasks reuse it and add only new boundary assertions. Run the smallest relevant checks and the task's required safety/adapter tests. Broaden only for changed boundaries or unresolved failures. Report exact commands, environment, observed result and limitations; distinguish unit, mocked, real integration and semantic evidence. A finite suite is evidence, not a claim of perfect security.

## Review and handoff

Review the diff against the issue and canonical contracts. Check changed authorization/state/retry boundaries, unnecessary abstractions or comments, and whether the evidence proves the claimed layer. Record defects with severity, location, failure, requirement and correction. An implementation review does not approve runtime business facts.

Write a local handoff in ignored `reports/` containing task/issue ID, date, commit, changed files, verified outcome, exact commands and results, environment/pins, requirement/scenario coverage, external actions, unresolved risks, owner decisions and next eligible task. Include failed attempts. Update the issue with authorized progress; PROJECT_STATE records milestone reality rather than duplicating issue statuses. Never count expected future work as complete.
