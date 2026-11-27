// Optional browser QA: npm install --prefix .qa --no-save --package-lock=false playwright-core@1.56.1
// Uses installed Chrome; does not download a browser or change application dependencies.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const { chromium } = await import(new URL('../.qa/node_modules/playwright-core/index.mjs', import.meta.url));
const out = path.join(root, 'out');
const reportDir = path.join(root, '.qa');
await fs.mkdir(reportDir, { recursive: true });
// Next's static export serves route payloads as index.txt with a text/plain MIME type.
const mime = { '.html': 'text/html; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.pdf': 'application/pdf', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let filename = path.resolve(out, `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`);
    if (!filename.startsWith(`${out}${path.sep}`)) { res.writeHead(403).end(); return; }
    if (!pathname.endsWith('/') && (await fs.stat(filename)).isDirectory()) {
      res.writeHead(308, { Location: `${pathname}/` }).end();
      return;
    }
    const data = await fs.readFile(filename);
    res.setHeader('Content-Type', mime[path.extname(filename)] || 'application/octet-stream');
    res.end(data);
  } catch { res.writeHead(404).end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.HOMEPAGE_QA_URL || `http://127.0.0.1:${server.address().port}`;
let browser;
const errors = [];
const results = [];
const routes = ['/', '/publications/', '/internships/', '/research_assistant/', '/awards/', '/cv/'];
const nav = { zh: ['关于我', '论文', '实习', '项目', '奖项', '简历'], en: ['About', 'Publications', 'Internships', 'Projects', 'Awards', 'CV'] };

async function noOverflow(page, label) {
  const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(size.scroll <= size.width + 1, `${label}: horizontal overflow ${JSON.stringify(size)}`);
}
async function checkAbstracts(page) {
  for (const excerpt of await page.locator('[data-abstract-excerpt]').all()) {
    const size = await excerpt.evaluate(el => ({ height: el.getBoundingClientRect().height, line: parseFloat(getComputedStyle(el).lineHeight), truncated: el.dataset.excerptTruncated === 'true', text: el.textContent.trim() }));
    assert.ok(size.height <= size.line * 2 + 1, 'Abstract excerpt exceeds two lines');
    if (size.truncated) assert.ok(size.text.endsWith('...'), 'Truncation must use three literal dots');
    else assert.ok(size.text.endsWith('.') && !size.text.endsWith('...'), 'Short sentences should stay complete');
  }
}
async function checkCompactProjects(page, expectedIds) {
  const projects = page.locator('[data-project-card]');
  assert.deepEqual(await projects.evaluateAll(elements => elements.map(el => el.id)), expectedIds);
  assert.equal(await projects.locator('[data-project-tags] > span').count(), expectedIds.length * 5);
  for (const project of await projects.all()) {
    const paragraph = project.locator('[data-project-description]:visible p');
    assert.equal(await paragraph.count(), 1, 'One concise paragraph per project');
    assert.ok(await paragraph.evaluate(el => el.getBoundingClientRect().height <= parseFloat(getComputedStyle(el).lineHeight) * 4 + 1), `${await project.getAttribute('id')}: exceeds four lines`);
    assert.ok(await paragraph.evaluate(el => el.getBoundingClientRect().height >= parseFloat(getComputedStyle(el).lineHeight) * 3 - 1), `${await project.getAttribute('id')}: too short`);
    const tags = project.locator('[data-project-tags]');
    const metrics = await tags.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, rows: new Set([...el.children].map(tag => tag.getBoundingClientRect().top)).size }));
    assert.equal(metrics.rows, 1, 'Technology tags must stay on one line');
    if (page.viewportSize().width >= 1024) assert.ok(metrics.scroll <= metrics.width + 1, 'Desktop tags must fit without scrolling');
    if (page.viewportSize().width >= 768 && await project.locator('[data-project-resources]').count()) {
      const title = await project.locator('h3').boundingBox();
      const buttons = await project.locator('[data-project-resources]').boundingBox();
      assert.ok(Math.abs(title.y + title.height / 2 - buttons.y - buttons.height / 2) < 2, 'Project title and resource buttons must align');
    }
  }
}
async function checkInternships(page) {
  await checkCompactProjects(page, ['deepfake-redteam', 'deepfake-detection', 'deepfake-decision', 'mineru', 'citevqa']);
  assert.equal(await page.locator('[data-project-card][data-review-highlight]').count(), 2);
}
async function checkResearchProjects(page) {
  await checkCompactProjects(page, ['layerrecall', 'catbox', 'gsa-yolo']);
}
async function checkAwards(page) {
  const rows = page.locator('[data-dated-entry]');
  assert.equal(await page.locator('[data-dated-entries]').count(), 2);
  assert.equal(await rows.count(), 8);
  assert.deepEqual(await rows.locator('time').allTextContents(), ['2024.12', '2025.12', '2024.11', '2025.11', '2025.07', '2021.09', '2024.12', '2026.05']);
  assert.ok(!/GPA|4\.39|1\.27%/.test(await page.locator('main').innerText()));
  for (const id of ['academic-honors', 'competition-awards']) {
    const dates = await page.locator(`#${id} time`).evaluateAll(elements => elements.map(el => el.getBoundingClientRect().right));
    assert.ok(Math.max(...dates) - Math.min(...dates) < 1, 'Award dates must align on the right');
  }
}
async function checkCv(page) {
  const chinese = await page.locator('html').getAttribute('lang') === 'zh';
  assert.equal(await page.locator('object, embed, iframe').count(), 0, 'CV must use webpage text instead of an embedded PDF');
  const text = page.locator('[data-cv-text]');
  const sections = chinese ? ['教育背景', '实习经历', '科研经历', '专业技能'] : ['Education', 'Internships', 'Research Experience', 'Technical Skills'];
  assert.deepEqual(await text.locator('h2').allTextContents(), sections);
  const content = await text.innerText();
  assert.ok(content.length > 1400, 'The old CV must be transcribed in full');
  assert.ok(!content.includes('**'), 'Markdown emphasis must render without literal asterisks');
  assert.ok(!content.includes('拟录取'), 'Remove pending-admission wording from the webpage text');
  for (const project of ['MinerU2.5-pro', 'CiteVQA', 'LayerRecall', 'GSA-YOLO', 'CatBOX']) assert.ok(content.includes(project));
  await page.getByRole('note').getByText(chinese ? '需要更新简历' : 'CV needs updating', { exact: true }).waitFor();
  assert.notEqual(await page.getByRole('note').getAttribute('data-review-highlight'), null);
  const download = page.locator('[data-cv-download] a');
  assert.equal(await download.count(), 1);
  assert.equal(await download.getAttribute('href'), '/files/CV.pdf');
  assert.notEqual(await download.getAttribute('download'), null);
  const style = await download.evaluate(el => ({ color: getComputedStyle(el).color, border: getComputedStyle(el).borderTopColor }));
  assert.equal(style.color, style.border, 'Download button must use the shared gold accent for its label and border');
  const buttonPosition = await download.boundingBox();
  const textPosition = await text.boundingBox();
  assert.ok(buttonPosition.y < textPosition.y, 'Download button must precede the written CV');
}
async function selectLanguage(page, target) {
  const current = await page.locator('html').getAttribute('lang');
  if (current === target) return;
  await page.locator('nav button[title]:visible').filter({ hasText: current === 'zh' ? '中文' : 'English' }).click();
  await page.getByRole('button', { name: target === 'en' ? 'English EN' : '中文 ZH', exact: true }).click();
  await page.waitForFunction(lang => document.documentElement.lang === lang, target);
}

try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US', colorScheme: 'light', reducedMotion: 'reduce' });
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(base).origin });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(30000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && /hydration|react error/i.test(message.text())) errors.push(message.text()); });
  let response = await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200);
  // An English browser must still get Chinese on its first visit.
  await page.getByRole('heading', { name: '关于我', exact: true }).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh');
  assert.equal(await page.locator('object').count(), 0);
  assert.equal(await page.locator('a[href^="mailto:"]').count(), 0);
  const papers = page.locator('[data-selected-publications] article');
  assert.deepEqual(await papers.evaluateAll(elements => elements.map(el => el.dataset.publicationId)), ['layerrecall', 'gsa-yolo', 'citevqa']);
  assert.equal(await papers.locator('span.font-semibold.text-accent').count(), 3);
  for (const card of await papers.all()) {
    assert.ok(!(await card.innerText()).includes('在审'));
    assert.equal(await card.getAttribute('lang'), 'en');
  }
  await checkAbstracts(page);
  assert.match(await page.locator('[data-publication-id="gsa-yolo"]').innerText(), /Chengyou Wang\*/);
  assert.match(await page.locator('[data-publication-id="citevqa"]').innerText(), /Conghui He\*/);
  assert.equal(await page.locator('#featured-deeptrace [data-review-highlight]').count(), 1);
  assert.equal(await page.locator('#about > section').first().locator('[data-review-highlight]').count(), 1);
  const contact = page.locator('[data-profile-contacts]');
  assert.equal(await contact.getByRole('button').count(), 1);
  assert.equal(await contact.getByRole('link').count(), 2);
  assert.equal(await contact.getByRole('link', { name: 'ORCID' }).getAttribute('href'), 'https://orcid.org/0009-0001-5008-2222');
  assert.equal(await contact.getByRole('link', { name: 'GitHub' }).getAttribute('href'), 'https://github.com/KJHkong');
  await contact.getByRole('button', { name: '邮箱', exact: true }).click();
  await page.getByText('jiahao_kong@163.com', { exact: true }).waitFor();
  assert.equal(await page.getByRole('link', { name: '发送', exact: true }).getAttribute('href'), 'mailto:jiahao_kong@163.com');
  await page.keyboard.press('Escape');
  const homepage = await page.locator('main').innerText();
  assert.ok(homepage.includes('孔嘉浩') && homepage.includes('DeepTrace'));
  assert.ok(!homepage.includes('FocusRL') && !homepage.includes('待入学') && !homepage.includes('AI Research & Engineering'));
  assert.ok(homepage.includes('推荐免试攻读硕士研究生') && homepage.includes('专业排名：1/79'));
  assert.ok(!homepage.includes('4.39') && !homepage.includes('1.27%'));
  const school = page.locator('#xuejun');
  assert.equal(await school.getByRole('heading').innerText(), '杭州学军中学');
  assert.match(await school.innerText(), /2020\.09.*2023\.06/);
  assert.equal(await school.locator('p.text-accent').innerText(), '技术选考生');
  assert.equal(await school.locator('div.text-neutral-600 > p').innerText(), '初中保送至杭州学军中学（西溪校区本部）');
  const educationCards = school.locator('..').locator(':scope > article');
  const educationStyles = await educationCards.locator('div.text-neutral-600 > p').evaluateAll(elements => elements.map(el => ({ color: getComputedStyle(el).color, weight: getComputedStyle(el).fontWeight })));
  assert.equal(educationStyles.length, 3);
  assert.ok(educationStyles.every(style => style.color === educationStyles[0].color && style.weight === educationStyles[0].weight));
  assert.equal(await page.getByText('专业排名：1/79', { exact: true }).locator('strong').count(), 0);
  const news = page.getByRole('heading', { name: '动态', exact: true }).locator('..');
  assert.deepEqual(await news.locator('span').allTextContents(), ['2026-12', '2026-11', '2026-10', '2026-09', '2026-06', '2026-05', '2026-03', '2026-01']);
  assert.deepEqual(await news.locator('[data-review-highlight]').evaluateAll(elements => elements.map(el => el.dataset.newsDate)), ['2026-12', '2026-11']);
  assert.equal(await page.getByRole('combobox').count(), 0);
  results.push('Homepage corresponding-author stars, two-line excerpts, advisor/DeepTrace/news highlights, newest-first dates, and no duplicate dropdown');
  assert.ok(!(await page.locator('main').innerText()).includes('PaperPilot'));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(reportDir, 'home-zh-desktop.png'), fullPage: true });

  for (const locale of ['zh', 'en']) {
    await selectLanguage(page, locale);
    for (let i = 0; i < routes.length; i++) {
      response = await page.goto(`${base}${routes[i]}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      const links = page.locator('nav a[data-nav-href]');
      assert.deepEqual(await links.allTextContents(), nav[locale]);
      await page.getByRole('heading', { name: i === 0 ? (locale === 'zh' ? '孔嘉浩' : 'Jiahao Kong') : nav[locale][i], exact: true }).waitFor();
      await noOverflow(page, `${locale} ${routes[i]} desktop`);
      if (routes[i] === '/cv/') await checkCv(page);
      if (routes[i] === '/internships/') await checkInternships(page);
      if (routes[i] === '/research_assistant/') await checkResearchProjects(page);
      if (routes[i] === '/awards/') await checkAwards(page);
      results.push(`${locale} ${routes[i]}: route, content, navigation, no overflow`);
    }
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), locale);
  }

  await page.goto(`${base}/publications/`, { waitUntil: 'networkidle' });
  const publicationCards = page.locator('[data-publication-card]');
  assert.equal(await publicationCards.count(), 4);
  assert.deepEqual(await publicationCards.evaluateAll(elements => elements.map(el => el.id)), ['layerrecall', 'gsa-yolo', 'citevqa', 'tailprop']);
  assert.equal(await page.locator('#catbox').count(), 0);
  assert.equal(await page.getByRole('button', { name: 'BibTeX', exact: true }).count(), 4);
  assert.match(await page.locator('#citevqa').innerText(), /ICLR/);
  assert.match(await page.locator('#layerrecall').innerText(), /Jiahao Kong/);
  assert.match(await page.locator('#gsa-yolo').innerText(), /2026/);
  for (const card of await publicationCards.all()) {
    await card.scrollIntoViewIfNeeded();
    for (const figure of await card.locator('img').all()) {
      await figure.scrollIntoViewIfNeeded();
      await figure.evaluate(image => image.decode());
    }
    assert.equal(await card.locator('[data-publication-authors] .font-semibold').count(), 1);
    await card.getByRole('button', { name: 'Abstract', exact: true }).click();
    assert.ok((await card.locator('[data-full-abstract]').innerText()).length > 500);
    await card.getByRole('button', { name: 'BibTeX', exact: true }).click();
    assert.equal(await card.locator('[data-full-abstract]').count(), 0);
    const citation = await card.locator('[data-bibtex-content]').innerText();
    assert.ok(citation.includes('2026'));
    await card.getByRole('button', { name: 'Copy to clipboard', exact: true }).click();
    await card.getByText('Copied', { exact: true }).waitFor();
    assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), citation.replace(/\r\n/g, '\n'));
    await card.getByRole('button', { name: 'BibTeX', exact: true }).click();
  }
  const layerLinks = page.locator('#layerrecall [data-publication-resources]');
  assert.equal(await layerLinks.getByRole('link', { name: 'Code', exact: true }).getAttribute('href'), 'https://github.com/Yixuan-Ding-ZJU/LayerRecall');
  assert.equal(await layerLinks.getByRole('link', { name: 'Project Page', exact: true }).getAttribute('href'), 'https://yixuan-ding-zju.github.io/LayerRecall_Web/');
  assert.equal(await layerLinks.getByRole('link', { name: 'Hugging Face', exact: true }).getAttribute('href'), 'https://huggingface.co/Yixuan-Ding-ZJU/LayerRecall');
  assert.equal(await layerLinks.getByRole('link', { name: 'Demo', exact: true }).getAttribute('href'), 'https://huggingface.co/spaces/Yixuan-Ding-ZJU/layerrecall-long-video');
  await checkAbstracts(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(reportDir, 'publications-en-light.png'), fullPage: true });
  const search = page.getByRole('searchbox', { name: 'Search publications...' });
  await search.fill('LayerRecall');
  assert.equal(await publicationCards.count(), 1);
  await search.fill('no-such-paper');
  await page.getByText('No publications found matching your criteria.').waitFor();
  await search.fill('');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  const yearGroup = page.getByRole('group', { name: 'Year', exact: true });
  await yearGroup.getByRole('button', { name: '2027', exact: true }).click();
  assert.equal(await publicationCards.count(), 3);
  await yearGroup.getByRole('button', { name: '2026', exact: true }).click();
  assert.equal(await publicationCards.count(), 1);
  await yearGroup.getByRole('button', { name: 'All', exact: true }).click();
  const typeGroup = page.getByRole('group', { name: 'Type', exact: true });
  await typeGroup.getByRole('button', { name: 'Journal', exact: true }).click();
  assert.equal(await publicationCards.count(), 1);
  await typeGroup.getByRole('button', { name: 'Conference', exact: true }).click();
  assert.equal(await publicationCards.count(), 3);
  results.push('Four illustrated publication cards, complete abstracts, independent panels, real clipboard copies, source citations, resources, search and filters');

  await page.goto(`${base}/research_assistant/`, { waitUntil: 'networkidle' });
  await checkResearchProjects(page);
  assert.deepEqual(await page.locator('[data-project-resources] a').evaluateAll(links => links.map(link => link.getAttribute('href'))), [
    'https://arxiv.org/pdf/2608.28460', 'https://github.com/Yixuan-Ding-ZJU/LayerRecall',
    'https://yixuan-ding-zju.github.io/LayerRecall_Web/', 'https://huggingface.co/spaces/Yixuan-Ding-ZJU/layerrecall-long-video', '/publications/#layerrecall',
    'https://arxiv.org/pdf/2505.17393.pdf', 'https://github.com/Lab-of-Catalysis-AI/CatBOX',
    'https://www.nature.com/articles/s41598-026-55599-2.pdf', 'https://github.com/KJHkong/GSA-YOLO', '/publications/#gsa-yolo',
  ]);
  for (const id of ['layerrecall', 'gsa-yolo']) {
    await page.goto(`${base}/research_assistant/`, { waitUntil: 'networkidle' });
    await page.locator(`#${id} [data-project-resources]`).getByRole('link', { name: 'Paper details', exact: true }).click();
    await page.waitForURL(new RegExp(`/publications/?#${id}$`));
    await page.locator(`#${id}[data-publication-card]`).waitFor();
    await page.waitForTimeout(500);
    const target = await page.locator(`#${id}[data-publication-card]`).boundingBox();
    assert.ok(target.y >= 70 && target.y < page.viewportSize().height);
  }
  results.push('Three bilingual university projects: individual 3–4-line paragraphs, single-line tags, ten resource buttons and existing LayerRecall/GSA-YOLO paper anchors; Xuejun education added');
  await page.goto(`${base}/internships/`, { waitUntil: 'networkidle' });
  await checkInternships(page);
  const projectResources = page.locator('[data-project-resources] a');
  assert.deepEqual(await projectResources.evaluateAll(links => links.map(link => link.getAttribute('href'))), [
    'https://github.com/KJHkong/DeepFake-Red-Team-Attacker', 'https://deepfake-redteam-showcase.pages.dev/', 'https://arxiv.org/pdf/2604.04771',
    'https://github.com/opendatalab/MinerU', 'https://huggingface.co/opendatalab/MinerU2.5-Pro-2604-1.2B',
    'https://arxiv.org/pdf/2605.12882', 'https://github.com/opendatalab/CiteVQA', '/publications/#citevqa',
  ]);
  for (const link of await projectResources.all()) {
    const external = (await link.getAttribute('href')).startsWith('https://');
    assert.equal(await link.getAttribute('target'), external ? '_blank' : null);
    if (external) assert.match(await link.getAttribute('rel'), /noopener/);
  }
  const demoClass = await page.locator('#deepfake-redteam [data-project-resources]').getByRole('link', { name: 'Demo', exact: true }).getAttribute('class');
  await page.locator('#citevqa [data-project-resources]').getByRole('link', { name: 'Paper details', exact: true }).click();
  await page.waitForURL(/\/publications\/?#citevqa$/);
  await page.locator('#citevqa[data-publication-card]').waitFor();
  await page.waitForTimeout(500);
  const destination = await page.locator('#citevqa[data-publication-card]').boundingBox();
  assert.ok(destination.y >= 70 && destination.y < page.viewportSize().height, 'Paper details must land at the existing CiteVQA card');
  assert.equal(await page.locator('#layerrecall').getByRole('link', { name: 'Demo', exact: true }).getAttribute('class'), demoClass);
  results.push('Five bilingual internship projects: <=4-line paragraphs, single-line technology tags, ongoing highlights, eight resources, shared publication buttons and real CiteVQA anchor navigation');
  await page.goto(`${base}/internships/#mineru`, { waitUntil: 'networkidle' });
  await page.locator('#mineru').waitFor();
  assert.ok(await page.locator('#mineru').evaluate(el => el.getBoundingClientRect().top) >= 70);
  await page.goto(`${base}/cv/`, { waitUntil: 'networkidle' });
  const cvFile = path.join(root, 'public/files/CV.pdf');
  const cvAvailable = await fs.stat(cvFile).then(stat => stat.isFile(), () => false);
  if (cvAvailable) {
    assert.equal(await page.locator('object, embed, iframe').count(), 0);
    const downloadLink = page.getByRole('link', { name: 'Download PDF', exact: true });
    assert.equal(await downloadLink.getAttribute('href'), '/files/CV.pdf');
    assert.notEqual(await downloadLink.getAttribute('download'), null);
    assert.equal(await page.getByRole('link', { name: 'Open PDF', exact: true }).count(), 0);
    const pdfResponse = await context.request.get(`${base}/files/CV.pdf`);
    assert.equal(pdfResponse.status(), 200);
    assert.match(pdfResponse.headers()['content-type'], /application\/pdf/);
    const sourcePdf = await fs.readFile(cvFile);
    assert.deepEqual(await pdfResponse.body(), sourcePdf);
    const downloadPromise = page.waitForEvent('download');
    await downloadLink.click();
    const download = await downloadPromise;
    const downloadPath = path.join(reportDir, 'cv-download.pdf');
    await download.saveAs(downloadPath);
    assert.equal(await download.failure(), null);
    assert.deepEqual(await fs.readFile(downloadPath), sourcePdf);
    results.push('Project anchor destinations, written CV, old-version highlight, gold download button, no embedded preview and byte-identical PDF download');
  } else {
    assert.equal(await page.getByRole('button', { name: 'Download PDF', exact: true }).isDisabled(), true);
    assert.equal(await page.locator('object').count(), 0);
    results.push('Project anchor destinations and safe missing-CV state');
  }

  const toggle = page.locator('button[title^="Current theme:"]:visible');
  await toggle.click(); // system -> light
  await toggle.click(); // light -> dark
  assert.ok((await page.locator('html').getAttribute('class')).includes('dark'));
  await page.goto(`${base}/publications/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Filters', exact: true }).waitFor();
  for (const card of await publicationCards.all()) await card.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(reportDir, 'publications-en-dark.png'), fullPage: true });
  await page.reload({ waitUntil: 'networkidle' });
  assert.ok((await page.locator('html').getAttribute('class')).includes('dark'));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(reportDir, 'home-en-dark.png'), fullPage: true });
  results.push('Dark mode switching and persistence');

  for (const width of [320, 390, 640, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ['en', 'zh']) {
      await selectLanguage(page, locale);
      for (const route of routes) {
        await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
        await noOverflow(page, `${locale} ${route} at ${width}px`);
        if (route === '/' || route === '/publications/') await checkAbstracts(page);
        if (route === '/internships/') await checkInternships(page);
        if (route === '/research_assistant/') await checkResearchProjects(page);
        if (route === '/awards/') await checkAwards(page);
        if (route === '/cv/') await checkCv(page);
      }
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.locator('[data-profile-contacts] button').click();
      await noOverflow(page, `${locale} email popover at ${width}px`);
      await page.keyboard.press('Escape');
    }
    results.push(`${width}px: all six pages in both languages without horizontal overflow`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '打开主菜单', exact: true }).click();
  const mobileLinks = page.locator('nav a:visible').filter({ hasNotText: '孔嘉浩' });
  assert.deepEqual(await mobileLinks.allTextContents(), nav.zh);
  await page.getByRole('link', { name: '实习', exact: true }).click();
  await page.getByRole('heading', { name: '实习', exact: true }).waitFor();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(reportDir, 'internships-zh-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: '打开主菜单', exact: true }).click();
  await page.getByRole('link', { name: '项目', exact: true }).click();
  await page.getByRole('heading', { name: '项目', exact: true }).waitFor();
  await page.getByRole('button', { name: '打开主菜单', exact: true }).click();
  await page.getByRole('link', { name: '关于我', exact: true }).click();
  await page.getByRole('heading', { name: '孔嘉浩', exact: true }).waitFor();
  await page.screenshot({ path: path.join(reportDir, 'home-zh-mobile.png'), fullPage: true });
  results.push('Mobile menu opens, contains six links, and navigates correctly');
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(reportDir, 'browser-results.json'), JSON.stringify({ passed: true, results, errors }, null, 2));
  console.log(JSON.stringify({ passed: true, results, errors }, null, 2));
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
