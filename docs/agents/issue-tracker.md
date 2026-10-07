# Issue tracker

GitHub Issues in `canhta/TruthBase` are the sole source of implementation scope, acceptance, progress and blocking relationships. Specs remain in this repository; issues link to their governing sections. Keep no local issue-body, task-list or status copies.

Use `gh issue view NUMBER --repo canhta/TruthBase --comments` to read a ticket. For multiline writes, use `--body-file`. Keep comments, labels and state changes within the user's authorized task. Use the [triage vocabulary](triage-labels.md).

Native blocking relationships are authoritative. Before claiming a ticket, inspect `gh api repos/canhta/TruthBase/issues/NUMBER/dependencies/blocked_by` and confirm each blocker is closed with acceptance evidence. Only an unblocked, fully specified issue is `ready-for-agent`. Generated implementation issues do not need incoming-request triage again.

PRs as a request surface: no.
