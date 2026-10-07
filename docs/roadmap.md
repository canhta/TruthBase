# Implementation issues

GitHub Issues own scope, acceptance, status and blocking dependencies. This page maps stable task IDs used by requirements and scenarios to their issues; it is not a second task tracker. Select an unblocked issue using the [tracker conventions](agents/issue-tracker.md).

## M1 — Integrated synthetic pilot

| Task | Issue |
|---|---|
| [M00: Local scaffold](https://github.com/canhta/TruthBase/issues/1) | #1 |
| [M01: Hindsight capability probe](https://github.com/canhta/TruthBase/issues/2) | #2 |
| [M02: Hermes provider capability probe](https://github.com/canhta/TruthBase/issues/3) | #3 |
| [M03: Canonical revisions and digests](https://github.com/canhta/TruthBase/issues/4) | #4 |
| [M04: Identity and authorization boundary](https://github.com/canhta/TruthBase/issues/5) | #5 |
| [M05: Human review and minimal inbox](https://github.com/canhta/TruthBase/issues/6) | #6 |
| [M06: Synthetic imports and invalidation](https://github.com/canhta/TruthBase/issues/7) | #7 |
| [M07: Mode-aware canonical query](https://github.com/canhta/TruthBase/issues/8) | #8 |
| [M08: Exact-version publication](https://github.com/canhta/TruthBase/issues/9) | #9 |
| [M09: Approved Hindsight projection and recall](https://github.com/canhta/TruthBase/issues/10) | #10 |
| [M10: Governed Hermes runtime](https://github.com/canhta/TruthBase/issues/11) | #11 |
| [M11: Integrated milestone evidence](https://github.com/canhta/TruthBase/issues/12) | #12 |

## Deferred groups

F01 procedure learning and F02 irreversible cleanup are outside M1. Their behavior remains specified in [learning](specs/learning-and-skill-governance.md) and [lifecycle](specs/lifecycle-and-cleanup.md). Create bounded GitHub issues only when those groups are selected and their owner policies are resolved. Existing requirement/scenario IDs remain reserved for that work.
