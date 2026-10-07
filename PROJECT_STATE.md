# Project state

Updated: 2026-10-07.

## Verified reality

TruthBase contains the product contracts, implementation rules, evaluation definitions and a local documentation checker. Application code, runtime tests, adapter capability tests and deployment have not started. Source inspection commits for local upstream checkouts are recorded in the [upstream register](docs/specs/upstream-evidence.md); they are not validated runtime dependency pins.

The [GitHub issues](docs/roadmap.md) own task scope, live status and blocking dependencies. Choose an unblocked `ready-for-agent` issue; this file does not mirror issue status. Local review/handoff reports and upstream clones are excluded from Git.

## Delivery boundary

The user-confirmed M1 scope is recorded in ADR-11 through ADR-13 in the [decision register](docs/adr/decisions.md). MIT distribution is recorded in ADR-14. Real Hindsight and Hermes integration evidence is required for M1; no compatibility or safety result is inferred from documentation checks.

## Remaining owner decisions

The open questions in the decision register still block real-data processing, external customer access and irreversible cleanup where applicable. Publishing this synthetic specification does not authorize any of those runtime operations.
