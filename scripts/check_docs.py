import hashlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = ('.github', 'docs')
files = sorted([*ROOT.glob('*.md'), *(p for d in FOLDERS for p in (ROOT / d).rglob('*.md'))])
errors = []
counts = {'markdown_files': len(files), 'local_links': 0, 'json_examples': 0}


def require(condition, message):
    if not condition:
        errors.append(message)


def anchors(text):
    seen = {}
    result = set()
    for title in re.findall(r'^#{1,6}\s+(.+)$', text, re.M):
        slug = re.sub(r'[^\w\- ]', '', title.strip().lower()).replace(' ', '-')
        suffix = seen.get(slug, 0)
        result.add(slug if not suffix else f'{slug}-{suffix}')
        seen[slug] = suffix + 1
    return result


texts = {p: p.read_text(encoding='utf-8') for p in files}
for path, body in texts.items():
    name = path.relative_to(ROOT)
    require(bool(re.search(r'^#\s+\S', body, re.M)), f'{name}: missing title')
    fences = re.findall(r'^```([^\n]*)$', body, re.M)
    require(len(fences) % 2 == 0, f'{name}: unbalanced code fences')
    for raw in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)', body):
        url = urlsplit(raw.strip('<>'))
        if url.scheme or url.netloc:
            continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        counts['local_links'] += 1
        require(target.is_relative_to(ROOT), f'{name}: link outside repository: {raw}')
        require(target.exists(), f'{name}: broken link: {raw}')
        if url.fragment and target.is_file() and target.suffix == '.md':
            require(unquote(url.fragment) in anchors(target.read_text()), f'{name}: missing anchor: {raw}')
    for example in re.findall(r'^```json\s*\n(.*?)^```\s*$', body, re.M | re.S):
        try:
            json.loads(example)
            counts['json_examples'] += 1
        except ValueError as exc:
            errors.append(f'{name}: invalid JSON example: {exc}')

catalog = (ROOT / 'docs/evaluation.md').read_text()
scenarios = re.findall(r'^\| (E\d+) \|', catalog, re.M)
requirements_text = (ROOT / 'docs/spec.md').read_text()
requirements = re.findall(r'^\| (REQ-\d+) \|', requirements_text, re.M)
require(len(scenarios) == len(set(scenarios)), 'duplicate scenario definitions')
require(len(requirements) == len(set(requirements)), 'duplicate requirement definitions')
require(set(f'E{i:02}' for i in range(1, 63)) <= set(scenarios), 'an original E01-E62 scenario was lost')
require(set(requirements) == {f'REQ-{i:02}' for i in range(1, 29)}, 'requirement definitions differ from REQ-01–REQ-28')
for path, body in texts.items():
    for scenario in re.findall(r'\bE\d{2,}\b', body):
        require(scenario in scenarios, f'{path.relative_to(ROOT)}: unknown scenario {scenario}')
    for requirement in re.findall(r'\bREQ-\d{2,}\b', body):
        require(requirement in requirements, f'{path.relative_to(ROOT)}: unknown requirement {requirement}')

task_rows = [row for body in texts.values() for row in re.findall(r'\[(M\d{2})\]\((https://github.com/canhta/TruthBase/issues/\d+)\)', body)]
tasks = {task for task, _ in task_rows}
require(tasks == {f'M{i:02}' for i in range(12)}, 'contract task references must cover M00–M11')
for task in tasks:
    urls = {url for name, url in task_rows if name == task}
    require(len(urls) == 1, f'{task}: conflicting issue links')
for row in re.findall(r'^\| E\d+ \|.*$', catalog, re.M):
    owner = row.split('|')[-2]
    ids = re.findall(r'\b[MF]\d+\b', owner)
    require(bool(ids) and all(x in tasks or x in {'F01', 'F02'} for x in ids), f'invalid scenario owner: {row}')
invariants = re.findall(r'^\| (INV-\d+) \|', (ROOT / 'AGENTS.md').read_text(), re.M)
require(set(invariants) == {f'INV-{i:02}' for i in range(1, 13)} and len(invariants) == 12, 'invariant IDs changed')
vector_file = ROOT / 'docs/digest-vectors.json'
vectors = json.loads(vector_file.read_text())
for vector in vectors['vectors']:
    encoded = json.dumps(vector['input'], ensure_ascii=False, sort_keys=True, separators=(',', ':'))
    require(encoded == vector['canonical_utf8'], f"{vector['name']}: canonical vector text differs")
    digest = 'sha256:' + hashlib.sha256(encoded.encode('utf-8')).hexdigest()
    require(digest == vector['digest'], f"{vector['name']}: vector hash differs")
counts.update(requirements=len(requirements), scenarios=len(scenarios), tasks=len(tasks), invariants=len(invariants), digest_vectors=len(vectors['vectors']))
print(json.dumps({'status': 'failed' if errors else 'passed', **counts, 'errors': errors}, indent=2))
sys.exit(bool(errors))
