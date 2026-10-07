# TruthBase

Governed memory for agents: evidence becomes a reviewed fact, and access is checked before that fact enters an answer.

**Status: specification and implementation planning.** The runtime is not implemented or production-ready. The first milestone is a synthetic refund-policy flow using Hindsight and Hermes: import evidence, clarify/revise, approve or decline, retrieve scoped facts, publish an exact version, then revoke access. Procedure learning and irreversible cleanup follow later.

## Start here

- [Documentation](docs/README.md): product scope and canonical contracts.
- [Implementation issues](docs/roadmap.md): work and blocking dependencies on GitHub.
- [Project state](PROJECT_STATE.md): verified implementation reality.
- [Contributing](CONTRIBUTING.md): focused changes, meaningful tests and PR expectations.

Agents read [AGENTS.md](AGENTS.md), the selected issue and its linked contracts. [CONTEXT.md](CONTEXT.md) owns vocabulary; [ADRs](docs/adr/decisions.md) own design choices.

## Check the documentation

Python 3.12 or newer; no third-party packages required:

```sh
git clone https://github.com/canhta/TruthBase.git
cd TruthBase
python3 scripts/check_docs.py
```

The check validates links, structured examples, traceability and digest vectors. It does not run application or upstream integration tests.

Local upstream checkouts live under ignored `.upstream/`. Reports stay under ignored `reports/`. Their presence is not required to clone, review or validate the public repository.

## License and security

[MIT](LICENSE). Upstream projects retain their own licenses and are not vendored here. Report vulnerabilities through the private channel in [SECURITY.md](SECURITY.md).
