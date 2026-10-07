# TruthBase

Governed memory for agents: evidence becomes a reviewed fact, and access is checked before that fact enters an answer.

The design covers evidence ingestion, human review, scoped retrieval, exact-version publication and revocation, with Hindsight and Hermes integrations. The planned product includes an Astryx web console for access and connection settings, Docker packaging, and MCP access for Codex/OpenCode. [GitHub Issues](https://github.com/canhta/TruthBase/issues) are the sole source for implementation scope, progress and blockers.

## Documentation

| Read for | File |
|---|---|
| Agent instructions | [AGENTS.md](AGENTS.md) |
| Domain vocabulary | [CONTEXT.md](CONTEXT.md) |
| Contribution, code, tests and handoff | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Product, architecture and requirements | [Specification](docs/spec.md) |
| Fact model, evidence and human review | [Facts](docs/facts.md) |
| Authorization, publication and retrieval | [Access](docs/access.md) |
| Transactions, concurrency and revocation ordering | [Consistency](docs/consistency.md) |
| API shapes and examples | [API](docs/api.md) |
| Learning, cleanup and operations | [Lifecycle](docs/lifecycle.md) |
| Hindsight, Hermes and upstream source records | [Integrations](docs/integrations.md) |
| Evaluation criteria and scenarios | [Evaluation](docs/evaluation.md) |
| Design choices and owner decisions | [ADRs](docs/adr/decisions.md) |

Read only the sections linked by your issue. Contracts and evaluation cases specify expected behavior; they do not record implementation status or passing results.

## Documentation check

Python 3.12 or newer; no third-party packages required:

```sh
git clone https://github.com/canhta/TruthBase.git
cd TruthBase
python3 scripts/check_docs.py
```

The check validates links, examples, traceability and digest vectors. Application and integration evidence belongs in the relevant issue. Local upstream checkouts (`.upstream/`) and reports (`reports/`) are ignored and are not required to validate this repository.

## License and security

[MIT](LICENSE). Upstream projects retain their own licenses and are not vendored here. Report vulnerabilities through [SECURITY.md](SECURITY.md).
