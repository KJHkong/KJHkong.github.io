// Configuration and bibliography checks using only existing project dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { parse } = require('smol-toml');
const root = path.resolve(__dirname, '..');
const cache = new Map();

// Load the server-side TypeScript parsers without adding a test runner.
function loadTs(filename) {
  const resolved = path.resolve(root, filename);
  if (cache.has(resolved)) return cache.get(resolved).exports;
  const module = { exports: {} };
  cache.set(resolved, module);
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith('@/')) return loadTs(`src/${specifier.slice(2)}.ts`);
    if (specifier.startsWith('.')) return loadTs(path.resolve(path.dirname(resolved), `${specifier}.ts`));
    return require(specifier);
  };
  new Function('require', 'module', 'exports', '__dirname', '__filename', code)(localRequire, module, module.exports, path.dirname(resolved), resolved);
  return module.exports;
}
const { parseBibTeX } = loadTs('src/lib/bibtexParser.ts');
const { getBibtexContent, resolveTextPageConfig } = loadTs('src/lib/content.ts');
const expectedTargets = ['about', 'publications', 'internships', 'research_assistant', 'awards', 'cv'];
for (const folder of ['content', 'content_zh']) {
  for (const file of fs.readdirSync(path.join(root, folder))) {
    if (file.endsWith('.toml')) parse(fs.readFileSync(path.join(root, folder, file), 'utf8'));
    assert.ok(fs.existsSync(path.join(root, folder === 'content' ? 'content_zh' : 'content', file)), `${file} must exist in both languages`);
  }
  const config = parse(fs.readFileSync(path.join(root, folder, 'config.toml'), 'utf8'));
  assert.deepEqual(config.navigation.map(item => item.target), expectedTargets);
  for (const item of config.navigation) assert.ok(fs.existsSync(path.join(root, folder, `${item.target}.toml`)));
}
const config = parse(fs.readFileSync(path.join(root, 'content/config.toml'), 'utf8'));
assert.equal(config.i18n.default_locale, 'zh');
assert.equal(config.i18n.fixed_locale, 'zh');
assert.equal(config.i18n.mode, 'fixed');
assert.equal(config.social.email, 'jiahao_kong@163.com');
assert.equal(config.social.github, 'https://github.com/KJHkong');
assert.equal(config.social.orcid, 'https://orcid.org/0009-0001-5008-2222');
assert.equal(config.social.google_scholar, '');

const canonical = getBibtexContent('publications.bib', 'en');
assert.equal(getBibtexContent('publications.bib', 'zh'), canonical);
const pubs = parseBibTeX(canonical, 'zh');
assert.equal(pubs.length, 4);
assert.equal(pubs.filter(pub => pub.status === 'published').length, 1);
assert.equal(pubs.filter(pub => pub.status === 'under-review').length, 2);
assert.equal(pubs.filter(pub => pub.status === 'accepted').length, 1);
const selected = pubs.filter(pub => pub.selected).sort((a, b) => a.selectedOrder - b.selectedOrder);
assert.deepEqual(selected.map(pub => pub.id), ['layerrecall', 'gsa-yolo', 'citevqa']);
for (const pub of selected) {
  assert.ok(pub.year);
  assert.ok(pub.summary.length > 30);
  assert.ok(pub.bibtex);
  assert.ok(!pub.bibtex.includes('abstract_excerpt'));
  assert.equal(pub.authors.filter(author => author.isHighlighted).length, 1);
  assert.equal(pub.authors.find(author => author.isHighlighted).name, 'Jiahao Kong');
}
assert.equal(pubs.find(pub => pub.id === 'catbox'), undefined);
assert.deepEqual([...pubs.map(pub => pub.id)].sort(), ['citevqa', 'gsa-yolo', 'layerrecall', 'tailprop']);
for (const pub of pubs) {
  assert.ok(pub.abstract.length > 500, `${pub.id}: complete abstract required`);
  assert.ok(fs.existsSync(path.join(root, 'public/papers', pub.preview)), `${pub.id}: representative figure missing`);
  assert.ok(pub.code.startsWith('https://github.com/'));
  const citation = require('bibtex-parse-js').toJSON(pub.bibtex)[0];
  assert.equal(citation.entryTags.year, '2026');
  assert.ok(!citation.entryTags.author.includes('*'));
  if (pub.id !== 'gsa-yolo') {
    assert.equal(citation.entryType, 'misc');
    assert.ok(citation.entryTags.eprint);
    assert.equal(citation.entryTags.booktitle, undefined, 'Preprint citations must not invent proceedings');
  }
}
assert.equal(pubs.find(pub => pub.id === 'tailprop').authors[0].name, 'Jiahao Kong');
assert.equal(pubs.find(pub => pub.id === 'tailprop').selected, false);
assert.ok(pubs.find(pub => pub.id === 'tailprop').conference.includes('CVPR'));
assert.equal(pubs.find(pub => pub.id === 'layerrecall').authorPosition, 'second');
assert.equal(pubs.find(pub => pub.id === 'layerrecall').authors.length, 5);
assert.equal(pubs.find(pub => pub.id === 'layerrecall').authors[3].isCorresponding, true);
assert.equal(pubs.find(pub => pub.id === 'gsa-yolo').authors.length, 2);
assert.equal(pubs.find(pub => pub.id === 'gsa-yolo').authors[1].name, 'Chengyou Wang');
assert.equal(pubs.find(pub => pub.id === 'gsa-yolo').authors[1].isCorresponding, true);
assert.equal(pubs.find(pub => pub.id === 'citevqa').authors.length, 12);
assert.equal(pubs.find(pub => pub.id === 'citevqa').authors[11].isCorresponding, true);
assert.equal(pubs.find(pub => pub.id === 'citevqa').authorPosition, 'fifth');
assert.ok(pubs.find(pub => pub.id === 'citevqa').conference.includes('ICLR'));

// Exercise future complete records, separate from personal content.
const fixture = parseBibTeX(`@inproceedings{verification-fixture,
  title={Parser verification fixture}, author={Kong, Jiahao and Doe, Jane},
  year={2024}, status={submitted}, author_position={second},
  pdf={https://example.invalid/paper.pdf}, code={https://example.invalid/code},
  project={https://example.invalid/project}, selected={true}
}`)[0];
assert.equal(fixture.year, 2024);
assert.equal(fixture.status, 'submitted');
assert.equal(fixture.authors[0].name, 'Jiahao Kong');
assert.equal(fixture.authors[0].isHighlighted, true);
assert.equal(fixture.pdfUrl, 'https://example.invalid/paper.pdf');
assert.equal(fixture.projectPage, 'https://example.invalid/project');
assert.ok(fixture.bibtex.includes('year = {2024}'));
assert.ok(!fixture.bibtex.includes('author_position'));
assert.equal(parseBibTeX('@misc{unknown-status, title={Unknown status}, status={invalid}}')[0].status, 'draft');
assert.equal(parseBibTeX('@misc{unknown-year, title={Unknown year}}')[0].year, undefined);

const missingCv = resolveTextPageConfig({ type: 'text', title: 'CV', source: 'cv.md', pdf: { path: '/files/does-not-exist.pdf' } });
assert.equal(missingCv.pdf.available, false);
const existingFile = resolveTextPageConfig({ type: 'text', title: 'CV', source: 'cv.md', pdf: { path: '/favicon.svg' } });
assert.equal(existingFile.pdf.available, true);
const outsidePublic = resolveTextPageConfig({ type: 'text', title: 'CV', source: 'cv.md', pdf: { path: '/../package.json' } });
assert.equal(outsidePublic.pdf.available, false);
console.log('PASS: bilingual schemas/navigation, canonical bibliography, truthful placeholders, complete-record parser, local CV availability.');
