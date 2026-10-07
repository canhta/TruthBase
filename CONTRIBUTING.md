# Contributing to TruthBase

TruthBase is currently a specification and implementation plan. Start with [project state](PROJECT_STATE.md), then one unblocked [implementation issue](docs/roadmap.md). For a new feature or contract change, open an issue describing the problem and a concrete expected outcome before implementation.

## Work on a change

1. Fork/clone the repository and create a focused branch.
2. Read [AGENTS.md](AGENTS.md) and [engineering rules](docs/agents/engineering.md), then only the contracts named by your issue.
3. Keep one authoritative definition of each behavior. Update references when replacing a document or implementation.
4. Run `python3 scripts/check_docs.py` with Python 3.12 or newer and `git diff --check`. The documentation checker has no third-party dependencies. Add application tests only for meaningful behavior once application code exists.
5. Open a PR explaining the problem, observable change and commands actually run. Link the issue/task and disclose untested paths.

Use synthetic fixtures. Keep credentials, customer data, local reports and upstream checkouts out of commits. Do not report a mocked adapter as a working integration. Follow the repository's risk-based test and minimal-comment rules rather than adding coverage for its own sake.

Contributions are accepted under the repository license. Respect other contributors: discuss the work, give actionable feedback, and avoid harassment or disclosure of private information. Maintainers may moderate issues and PRs that violate these expectations.
