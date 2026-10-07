# Learning and Skill Governance

Status: normative for the enabled feature. Knowledge proposals and anti-poisoning apply in M1; procedure evaluation/activation is deferred to F01. "Self-learning" means governed knowledge and procedure updates, not autonomous model-weight training.

## Three learning loops

| Loop | Trigger | Output | Activation gate |
|---|---|---|---|
| Knowledge | New or changed authorized source | Candidate fact revision, evidence or conflict | Fact review and eligibility |
| Experience | Verified correction or observed outcome | Scoped episode and regression test | Verification before use as evidence |
| Procedure | Repeated verified failure or improvement opportunity | Proposed skill revision | Evaluation, security review and approval |

An agent may propose and investigate; it does not grant itself authority to accept, share, delete or deploy. High confidence, positive feedback and repetition do not count as approval.

## Correction-to-learning workflow

Capture the original answer receipt and permitted inputs. Record the correction as a note by an identified actor. Establish the actor's authority and find independent supporting evidence. Create a candidate fact revision if the knowledge changed. Add a regression case that captures the mistake without exposing production data. Propose a scoped procedure change only if a generalizable failure is demonstrated.

Example: "Jira Done means released" was incorrect for a project. The new skill requires deployment evidence before asserting release. The skill does not change the project's business workflow by itself.

A user's assertion may be valuable but still unverified. Preserve `verified_outcome=false` until evidence or an authorized decision supports it. The original agent output and summaries of it are derivative evidence, never independent corroboration.

## Skill lifecycle

```text
proposed -> evaluating -> pending_approval -> approved -> active
    |            |               |
 declined     declined        declined
active -> retired or revoked
```

A skill revision includes scope, purpose, trigger, allowed tools, forbidden actions, steps, dependencies, rollback strategy, test cases and measured evaluation results. Revisions are immutable. Activation requires the approved exact content digest and deployment permission. Changed content returns to proposal; it does not inherit approval.

The person approving a procedure must have `approve_skill`; a fact approval does not confer this right. A project-specific skill must not become a global skill without a separately reviewed sanitized revision. Skill instructions are untrusted until admitted; they cannot override runtime capability limits.

Hermes has a skills system and a configurable skill-write approval gate [S04](upstream-evidence.md). The platform's independent evaluation, lineage and cross-agent publication workflow is custom work, not a claimed upstream feature.

## Evaluation

Run the changed scenario plus the existing regression suite against baseline and proposed versions. Include wrong-scope, unauthorized-source, missing-evidence and adversarial-source cases. Use deterministic assertions for state and permissions. Use human adjudication or a calibrated evaluator for semantic quality; do not let the proposing agent be the only judge.

Require no safety regressions and evidence of the intended improvement. Compare cost and latency under identical fixtures. A decline records a note and preserves the failed version; later improvement uses a new revision. Evaluation failure does not delete evidence of the attempt.

## Active discovery

Workers may identify missing implementation links, conflicting rules or stale evidence. They create bounded tasks, fetch only authorized sources and stop at budget or authority limits. Proposed initial budgets are 20 tool calls and one clarification request per deduplicated issue; owners may change them in versioned policy.

When blocked, preserve progress and continue independent permitted work. Do not repeatedly ask the same question, auto-escalate permissions or guess a missing answer. A clarification request is a durable work item, not a claim of completed research.

## Anti-poisoning rules

Reject instructions embedded in tickets, code comments and emails that attempt to change approval policy, disable security, add tools or publish secrets. Source text may describe an instruction as business content, but it cannot execute it. Normalize copied citations to their origin to prevent fake corroboration.

Retain an access-controlled correction history and failure taxonomy. Use this for evaluation and routing, not employee-ranking by default. Traceable improvement matters more than accumulating memory volume.

## Forgetting learned procedures

A source retraction, revoked fact or discovered skill vulnerability suspends dependent active skills before replacement evaluation. Review the dependency manifest; rebuild or retire as appropriate. Low usage alone is insufficient grounds to delete rare but important incident procedures.
