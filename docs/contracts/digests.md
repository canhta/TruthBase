# Digest contract

Owner: domain model. Codec ID: `gm-json-v1`. This is a platform encoding, not an upstream API. Implement it once in the domain package; clients echo server digests.

## Canonical bytes

1. Validate a typed payload before encoding. Reject duplicate object keys, unknown schema fields, non-finite values, floating-point numbers and unpaired Unicode surrogates. Allowed JSON values are objects, arrays, Unicode strings, booleans, null and integers in [-9007199254740991, 9007199254740991]. Exact decimal business values use schema-declared decimal strings; never silently round a float.
2. Sort object keys by Unicode scalar value. Preserve array order except the explicitly set-valued arrays below. Keep string code points unchanged: no case folding, trimming or Unicode normalization. Validation of a blank note is independent of its stored text.
3. Encode compact JSON as UTF-8 with no BOM, spaces or trailing newline. Escape quote and backslash; use `\b`, `\t`, `\n`, `\f`, `\r` for those controls and lowercase `\u00xx` for other U+0000–001F controls. Leave slash and other Unicode characters unescaped. Integers use base ten without leading zeros; zero is `0`.
4. Hash those bytes with SHA-256. Return `sha256:` followed by 64 lowercase hexadecimal characters. Include `digest_codec=gm-json-v1` in the review request and decision. A codec change requires new review requests; existing digest bindings remain historical.

Normalize all valid-time values to UTC `YYYY-MM-DDTHH:MM:SS.ffffffZ` before constructing a digest envelope. Null `valid_to` remains explicit. Required fields cannot be omitted or converted between null, empty string and empty array.

## Fact envelopes

Content envelope: `{domain: "gm.fact-content.v1", tenant_id, project_id, fact_id, supersedes_revision_id, claim}`. `claim` contains every required content field listed in the domain model, including uncertainty, authority basis, evidence IDs and epistemic type. Sort `evidence_ids` by Unicode scalar value and reject duplicates. Conditions/exceptions and all other arrays retain their validated order; reordering them requires a new revision. Revision IDs, review status, lifecycle state, confidence scores and mutable ACL generations are excluded.

Evidence envelope: `{domain: "gm.fact-evidence.v1", tenant_id, project_id, evidence}`. Sort evidence entries by `evidence_id`; reject duplicates. Each entry contains exactly `evidence_id`, `source_revision_id`, `source_content_hash`, `locator`, `excerpt_hash`, `relationship` (`support` or `contradict`), and `attestations`. Sort attestations by `attestation_id`; each contains that ID and its immutable `content_digest`. The locator is the validated source-type locator object, not a floating link. Evidence entries must match the content envelope's evidence IDs exactly.

Resolve hashes/attestations from canonical storage, never from caller assertions. Mutable access generations are checked separately and cannot alter an approved digest. Amended authority evidence needs a new revision; a revoked attestation blocks eligibility immediately.

## Publication envelopes

Content: `{domain: "gm.publication-content.v1", tenant_id, project_id, content, intended_audience, sanitized_citations}`. Citation order is preserved. Evidence: `{domain: "gm.publication-evidence.v1", tenant_id, project_id, dependencies, release_basis}`. Sort dependencies by `fact_revision_id`; each contains that ID, `digest_codec`, `content_digest` and `evidence_digest`. Reject duplicates. `release_basis` contains the exact basis ID, issuer, policy ID/version, scoped audience/transformation and its immutable content digest. Current basis/revocation generations are checked separately at approval and read time.

## Golden vectors and acceptance

[Golden vectors](digest-vectors.json) contain complete fact envelopes, exact canonical UTF-8 text and hashes. M03 must use them as independent expected values, then test reordered object keys/evidence sets, a changed exception/uncertainty/authority/epistemic type, duplicate keys, omitted/null fields, Unicode and prohibited numbers. Equivalent object-key order must hash identically; meaningful content or evidence changes must not. A serialization unit test does not prove approval binding: M05 also verifies stale-digest rejection and unchanged canonical state after failure.
