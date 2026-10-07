# Hindsight Adapter

Status: proposed integration. Exact SDK/server versions and signatures are unpinned until M01. Official sources: [S05-S08](upstream-evidence.md).

## Upstream versus platform responsibility

Hindsight documents `retain`, `recall` and `reflect`, along with observations and mental models. This platform supplies canonical facts, business approval, per-object policy, publication, dependency invalidation and cleanup orchestration. Do not treat a retained memory or a generated observation as an approved business fact.

No direct client access to Hindsight APIs, MCP or administration. The adapter runs under a service identity with narrow scoped bank access. A bank identifier is routing information, not an access credential.

## Projection policy

Only eligible approved canonical revisions may enter a serving projection. Candidate extraction and exploratory learning use a separate quarantine service/store that is never queried by serving agents. Unreviewed source text cannot be placed next to approved facts and later made safe merely by adding an `approved` tag.

Maintain a mapping: canonical revision ID + content/evidence digests + scope/audience + projection generation -> engine object IDs. Retain minimal approved text and metadata, not whole raw mail threads or unrestricted code. Track every input used by a derivative, including inputs not cited in its final prose.

New observations or mental-model claims are proposals unless they are faithful, verified renderings of already approved inputs. A newly inferred business conclusion goes through candidate review. Normal answers must preserve an approved inference's qualified epistemic type.

## Required adapter interface

The following is a platform abstraction, not a claim about upstream method names:

```text
project_approved_revision(revision, audience, generation) -> ProjectionReceipt
search_scoped(query, authorized_scope, generation) -> CandidateReferences
build_bounded_summary(input_revision_ids, audience, generation) -> DerivedProposal
invalidate(dependency_ids, minimum_generation) -> InvalidationReceipt
remove_projection(projection_ids, expected_generation) -> RemovalReceipt
reconcile(scope) -> DriftReport
```

Calls must preserve stable mapping, idempotency and expected generations. Adapter results always include canonical references; a result without resolvable lineage is not used for an answer.

## Audience partitions

The safe pilot choices are: identical-ACL audience banks populated solely with eligible facts, or canonical prefiltered retrieval without engine-side broad synthesis. Per-project separation alone is insufficient if members have different source permissions inside the project.

Use physical/logical tenant isolation appropriate to the deployment; prove the actual boundary with tests. If a requested user has a narrower audience than a bank, do not call broad `reflect` and filter its text afterward. Return to canonical retrieval or construct a strictly bounded authorized context outside the mixed bank.

Guests bypass general memory reflection and read exact publication objects. The engine cannot infer customer rights from fact tags.

## Filter pitfalls

Current recall documentation states that empty tag lists can mean no filter and that some default matching modes include untagged memories [S08](upstream-evidence.md). Reject empty security scopes at the gateway. Use only verified strict filters as supplemental partition controls; never use fuzzy tag matching for authorization. Test missing, empty, malformed, stale and unexpected tags.

Do not assume every endpoint applies tags identically. Contract-test recall, reflect, document expansion and mental-model operations individually. Security filtering must be enforced before a generation step, not only on returned IDs.

## Deletion and stale mental models

Do not rely solely on the engine's stale flag after a delete [S07](upstream-evidence.md). Canonical invalidation blocks reads first. Then remove or rebuild affected engine artifacts and verify their text/dependencies. Treat an empty-support model as withdrawn. An HTTP success is not an erasure certificate.

## Version and capability validation

M01/M09 must pin repository/server/SDK versions and document: self-host configuration; supported model and embedding routes; object mapping; idempotency; batch update/delete behavior; isolation; filter semantics; deletion effects; lineage completeness; restore behavior; and resource usage on the actual pilot workload.

The adapter may be marked partially supported with unsafe methods disabled. Canonical fallback is the required outage behavior. It does not complete M1: approved projection and scoped recall must also pass with real pinned Hindsight. Claiming an untested engine capability is not.
