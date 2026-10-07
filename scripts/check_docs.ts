import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path: string) => readFileSync(path, 'utf8');
const matches = (text: string, pattern: RegExp) => [...text.matchAll(pattern)];
const errors: string[] = [];
function require(condition: boolean, message: string) {
  if (!condition) errors.push(message);
}
function markdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : entry.name.endsWith('.md') ? [path] : [];
  });
}
const files = [
  ...readdirSync(root).filter(name => name.endsWith('.md')).map(name => join(root, name)),
  ...['.github', 'docs'].flatMap(name => markdownFiles(join(root, name))),
].sort();
const texts = new Map(files.map(path => [path, read(path)]));
const counts = { markdown_files: files.length, local_links: 0, json_examples: 0 };
function anchors(text: string): Set<string> {
  const seen = new Map<string, number>();
  return new Set(matches(text, /^#{1,6}\s+(.+)$/gm).map(match => {
    const slug = (match[1] ?? "").trim().toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu, '').replaceAll(' ', '-');
    const suffix = seen.get(slug) ?? 0;
    seen.set(slug, suffix + 1);
    return suffix ? `${slug}-${suffix}` : slug;
  }));
}
for (const [path, body] of texts) {
  const name = relative(root, path);
  require(/^#\s+\S/m.test(body), `${name}: missing title`);
  require(matches(body, /^```([^\n]*)$/gm).length % 2 === 0, `${name}: unbalanced code fences`);
  for (const match of matches(body, /(?<!!)\[[^\]]+\]\(([^)]+)\)/g)) {
    const raw = (match[1] ?? "");
    const link = raw.replace(/^<|>$/g, '');
    if (/^[a-z][a-z\d+.-]*:/i.test(link) || link.startsWith('//')) continue;
    counts.local_links++;
    const [location = '', fragment] = link.split('#', 2);
    const localPath = decodeURIComponent((location.split('?', 1)[0] ?? ''));
    const target = localPath ? resolve(dirname(path), localPath) : path;
    const actual = existsSync(target) ? realpathSync(target) : target;
    const relativePath = relative(root, actual);
    require(relativePath !== '..' && !relativePath.startsWith('../') && !isAbsolute(relativePath), `${name}: link outside repository: ${raw}`);
    require(existsSync(target), `${name}: broken link: ${raw}`);
    if (fragment && existsSync(target) && statSync(target).isFile() && extname(target) === '.md') {
      require(anchors(read(target)).has(decodeURIComponent(fragment)), `${name}: missing anchor: ${raw}`);
    }
  }
  for (const match of matches(body, /^```json\s*\n(.*?)^```\s*$/gms)) {
    try {
      JSON.parse((match[1] ?? ""));
      counts.json_examples++;
    } catch (error) {
      errors.push(`${name}: invalid JSON example: ${String(error)}`);
    }
  }
}
const catalog = read(join(root, 'docs/evaluation.md'));
const scenarios = matches(catalog, /^\| (E\d+) \|/gm).map(m => (m[1] ?? ""));
const requirements = matches(read(join(root, 'docs/spec.md')), /^\| (REQ-\d+) \|/gm).map(m => (m[1] ?? ""));
const ids = (prefix: string, first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => `${prefix}${String(i + first).padStart(2, '0')}`);
const sameSet = (a: string[], b: string[]) => new Set(a).size === new Set(b).size && a.every(x => b.includes(x));
require(scenarios.length === new Set(scenarios).size, 'duplicate scenario definitions');
require(requirements.length === new Set(requirements).size, 'duplicate requirement definitions');
require(ids('E', 1, 62).every(x => scenarios.includes(x)), 'an original E01-E62 scenario was lost');
require(sameSet(requirements, ids('REQ-', 1, 39)), 'requirement definitions differ from REQ-01–REQ-39');
for (const [path, body] of texts) {
  for (const [id] of matches(body, /\bE\d{2,}\b/g)) require(scenarios.includes(id), `${relative(root, path)}: unknown scenario ${id}`);
  for (const [id] of matches(body, /\bREQ-\d{2,}\b/g)) require(requirements.includes(id), `${relative(root, path)}: unknown requirement ${id}`);
}
const taskRows = [...texts.values()].flatMap(body => matches(body, /\[(M\d{2})\]\((https:\/\/github.com\/canhta\/TruthBase\/issues\/\d+)\)/g));
const tasks = [...new Set(taskRows.map(m => (m[1] ?? "")))];
require(sameSet(tasks, ids('M', 0, 19)), 'contract task references must cover M00–M19');
for (const task of tasks) require(new Set(taskRows.filter(m => m[1] === task).map(m => m[2])).size === 1, `${task}: conflicting issue links`);
for (const [row] of matches(catalog, /^\| E\d+ \|.*$/gm)) {
  const owners = matches(row.split('|').at(-2) ?? '', /\b[MF]\d+\b/g).map(m => m[0]);
  require(owners.length > 0 && owners.every(x => tasks.includes(x) || ['F01', 'F02', 'F03'].includes(x)), `invalid scenario owner: ${row}`);
}
const invariants = matches(read(join(root, 'AGENTS.md')), /^\| (INV-\d+) \|/gm).map(m => (m[1] ?? ""));
require(invariants.length === 12 && sameSet(invariants, ids('INV-', 1, 12)), 'invariant IDs changed');
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error('Non-JSON vector value');
  return encoded;
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
const vectorFile: unknown = JSON.parse(read(join(root, 'docs/digest-vectors.json')));
if (!isRecord(vectorFile) || !Array.isArray(vectorFile.vectors)) throw new Error('Invalid digest vector file');
const vectors: unknown[] = vectorFile.vectors;
for (const vector of vectors) {
  if (!isRecord(vector) || typeof vector.name !== 'string' || typeof vector.canonical_utf8 !== 'string' || typeof vector.digest !== 'string' || !('input' in vector)) throw new Error('Invalid digest vector');
  const encoded = canonical(vector.input);
  require(encoded === vector.canonical_utf8, `${vector.name}: canonical vector text differs`);
  require(`sha256:${createHash('sha256').update(encoded).digest('hex')}` === vector.digest, `${vector.name}: vector hash differs`);
}
console.log(JSON.stringify({ status: errors.length ? 'failed' : 'passed', ...counts, requirements: requirements.length, scenarios: scenarios.length, tasks: tasks.length, invariants: invariants.length, digest_vectors: vectors.length, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
