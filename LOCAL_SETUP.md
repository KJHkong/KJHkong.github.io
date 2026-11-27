# 孔嘉浩 · 本地使用与维护

## 2026-11-15 首页定制

中文版显示“孔嘉浩 / 硕士研究生 / 北京大学”，英文版为“Jiahao Kong / Master's Student / Peking University”。简介按学术背景、研究兴趣、科研助理经历、实习经历分为四段；导师占位已恢复并高亮，实验室名称仅使用学校名与英文简称。侧栏保留四项研究兴趣，“智能体系统”已统一简化为“智能体”。

邮箱、ORCID、GitHub 从两份 config.toml 读取。邮箱使用可点击、可按 Escape 关闭的浮窗，“发送”链接为 mailto，无需后端。导航“科研助理”改为“项目”，为保留原链接，URL 和文件名仍为 research_assistant。重复的 PageJump 下拉框已移除，窄屏使用 PRISM 原生三横线折叠菜单，320 像素屏幕也可打开。

首页论文保持全英文，按 `selected_order` 显示 LayerRecall、GSA-YOLO、CiteVQA；卡片展示正式标题、作者、venue、年份、最多两行的摘要首句，不显示投稿状态标签。摘要放得下时保留原句，超过两行时在完整词边界追加三个点；TwoLineExcerpt 监听宽度与字体加载变化。GSA-YOLO 已按用户更正加入 Chengyou Wang*，CiteVQA 的 Conghui He* 也已标记。完整论文列表仍读取同一 BibTeX 数据，并保留筛选功能。

精选项目为 MinerU-2.5pro（上海人工智能实验室）、DeepFake Red Team Attacker（网易）、DeepTrace（网易，待补充文字加粗并高亮）。教育经历中北大一栏为“推荐免试攻读硕士研究生”；本科描述仅保留“专业排名：1/79”，首页不显示 GPA 或百分比。八条动态按月份倒序，2026-11 和 2026-12 按用户提供的内容展示并高亮，作为后续核对项；不据未来日期动态自动修改 BibTeX 状态。

高亮由内容配置控制：卡片条目和动态条目均支持 `highlight = true`；简介的加粗 Markdown 显示为浅金色标记。后续资料确认后，可移除对应标记。

简介中北京大学、浙江大学、上海交通大学、上海人工智能实验室和网易（以及英文对应名称）使用单星号 Markdown 强调，渲染为模板的金黄色加粗文字，不增加背景色；双星号仍用于导师等待完善内容的背景高亮。

## 论文页定制

论文页按 LayerRecall、GSA-YOLO、CiteVQA、TailProp 顺序展示。`publications.toml` 的 `order` 控制顺序，`group_by_status = false` 使用不分组的卡片列表；搜索与年份、类型筛选保留。论文页使用较宽的容器，桌面左图右文，手机上下排列；关键图完整显示，点击可打开原尺寸图片。

五张原始图片从 `paper_representative_image/` 复制到 `public/papers/`，未覆盖原图。`preview` 指向主图文件名，`preview_additional` 可用逗号分隔追加图片，按顺序纵向排列；CiteVQA 的第二张图为 `CiteVQA_2.png`。LayerRecall 与 TailProp 使用 `preview_fit = {fill}`，在较紧凑的图片框内略微纵向拉伸，减少上下留白。卡片由 `PublicationCard.tsx` 渲染，摘要首句复用首页的 `TwoLineExcerpt.tsx`；完整摘要放在共享 BibTeX 的 `abstract` 中。

资源字段为 `pdf`、`code`、`project`、`hugging_face`、`demo`，缺失字段不显示按钮。代码使用 GitHub 图标，Hugging Face 使用拥抱表情标识。摘要与 BibTeX 按钮在卡片内展开，再次点击收起；切换时仅显示当前面板。复制按钮有成功/失败反馈，Clipboard API 不可用时尝试浏览器的复制回退。

## 实习页项目维护

中英文实习内容分别保存在 `content_zh/internships.toml` 与 `content/internships.toml`。公司卡片、岗位、日期、参与项目和左侧金线继续使用原有 CardPage 布局。

- `compact_projects = true` 启用实习项目的紧凑展示，不改变其他卡片页的标签换行规则。
- `content` 是信息最完整的单段介绍，`content_variants` 保存不同长度的完整改写，`compact_content` 为最短备用版本。共用的 `ProjectDescription.tsx` 根据实际字体与容器宽度选择内容最充实且不超过四行的版本；不再按固定断点切换到短摘要。实习和科研项目均按每个项目各自三至四行验收，不使用裁切或省略号。
- 每个项目保留五个技术标签。桌面完整展示为一行；窄屏可横向滑动标签条，支持键盘聚焦，不扩大页面宽度。
- `ongoing = true` 使用首页同款 `bg-accent/20` 淡金色背景、金色竖线，并在标题旁显示本地化“进行中”标识。DeepTrace 与 DeepFake Decision Model 已启用。
- `resources` 是 `{ kind, href }` 对象数组；支持 `pdf`、`code`、`huggingFace`、`demo`、`projectPage`、`details`。`ResourceLink.tsx` 从论文页原有按钮抽取，两个页面共用图标、颜色、圆角及交互；外链在新标签页打开，站内链接使用 Next Link。
- CiteVQA 详情保留原始 `/publications#citevqa` 目标；框架会按站点配置渲染为 `/publications/#citevqa`，仍定位到现有论文卡片。没有创建新详情路由。
- MinerU2.5-Pro PDF 使用 `2604.04771`，不使用基础版 `2509.22186`。

实习页目前包含网易三个项目（DeepFake Red Team Attacker、DeepTrace、DeepFake Decision Model）及 AI Lab 两个项目（MinerU2.5-Pro、CiteVQA）。项目说明与实验数字按用户提供的内容整理；后续可在对应 TOML 内更新阶段性结果和公开资源。

## 科研项目与新增教育经历

`content{,_zh}/research_assistant.toml` 维护三个高校项目，沿用与实习页相同的 CardPage、ProjectDescription 和 ResourceLink。

- 中文岗位为“生成式人工智能科研实习生”“科学智能科研助理”“计算机视觉科研助理”；上海交通大学、山东大学标题补充 Catalysis & AI Lab、CVWC Lab，机构介绍仅保留用户指定的研究方向。
- LayerRecall：四行左右的方法、个人工作和评测结果；提供 PDF、代码、项目主页、Demo、论文详情，详情沿用 `/publications#layerrecall`。
- CatBOX：混合变量贝叶斯优化、CSM+GSM 核推导与实现、3 倍以上及约 19 倍改进；提供用户指定的 arXiv PDF 与 GitHub。
- GSA-YOLO：软稀疏、SSS 剪枝、自适应蒸馏、2.4% / 1.8% 精度提升及 11.2% 提速；提供 SR 官方 PDF、代码及 `/publications#gsa-yolo` 详情。
- 每项保留五个主要技术标签，LayerRecall 的长程评测信息保留在正文中；桌面单行完整显示，窄屏标签条可横向滑动。
- `content{,_zh}/education.toml` 维护三段教育经历。学军中学标题为“杭州学军中学”，2020.09–2023.06，黄色副标题“技术选考生”，正文“初中保送至杭州学军中学（西溪校区本部）”。三段正文统一使用 `text-neutral-600` 和常规字重，“专业排名：1/79”整行不加粗。

## 奖项页维护

中英文 `awards.toml` 各包含“学业荣誉”“竞赛奖项”两个卡片，分别四条记录。每条使用 `[[items.entries]]`，配置 `title` 和 `date`；日期使用带引号的 `YYYY.MM` 字符串。

CardPage 复用原卡片和字体样式，以正文、日期两列排列条目。日期靠右对齐，窄屏名称可自然换行，日期保持完整。条目顺序由数据文件决定，不自动按日期排序。两次本科生国家奖学金独立列出，旧 GPA、排名及原竞赛占位均已替换。

**展示信息与引用信息分开维护**：`content/publications.bib` 是页面展示数据，`content/citations.bib` 是原始引用数据；`citation_key` 连接二者。两种语言读取同一份文件。三篇会议论文的展示年份为 2027，引用使用 arXiv 的预印本年份 2026，不添加尚未发布的会议卷页信息。GSA-YOLO 引用由 DOI 内容协商导出；当前官方记录只有 Jiahao Kong，展示作者按用户指示保留 Jiahao Kong、Chengyou Wang*，两份记录的差异有意保留待核对。

CatBOX 已从论文列表移除，其项目页条目保留，删除了指向已移除论文锚点的链接。TailProp 的展示 venue 按用户更新为 CVPR 2027；arXiv 当前注释仍写 ICLR 2027，后续可在原文更新后再次核对。

摘要来源及待办资料见 CONTENT_TODO.md。以下第一阶段架构与验证记录保留作历史参考。

## 启动与检查

```powershell
npm ci
npm run dev
```

浏览器打开 http://localhost:3000。Node.js 要求 >=22，本机验证环境为 v24.11.1 / npm 11.6.2。

本地网址只有在开发服务器运行期间才能访问。若显示 `ERR_CONNECTION_REFUSED`，先在项目目录运行 `npm run dev`，等待终端出现 `Ready` 后再刷新页面；运行期间保持该终端开启。也可访问 http://127.0.0.1:3000。电脑重启或服务器停止后需要重新启动。

Windows 下也可以直接双击根目录的 `start-local.cmd`。该入口固定使用本机 `127.0.0.1:3000`，启动后保留终端窗口；端口被占用时会报告错误，不会自动换成 3001。关闭终端或重启电脑后，重新双击即可启动。若当前服务已运行，无需重复启动。

在这台电脑上预览，直接访问 http://127.0.0.1:3000/ 即可，不需要端口转发。只有通过远程开发环境、隧道或其他设备访问时才需要另外检查转发；转发的目标必须对应这台电脑上实际运行的服务和端口。端口转发记录仍存在不代表开发服务器仍在运行。

2026-11-15 排查记录：开发服务器当时已停止，本机没有 3000 监听；恢复后六个页面及头像均返回 HTTP 200。VS Code 转发日志显示隧道连接成功，3000 为 **Private**。对 Dev Tunnels 地址的未登录请求返回 `401 Unauthorized`，不代表端口号配置错误。通过私有转发地址访问时，需要在浏览器中登录与 VS Code 建立转发时相同的账号；详情见 [VS Code 官方端口转发说明](https://code.visualstudio.com/docs/debugtest/port-forwarding)。本轮未修改转发可见性。

```powershell
npm run lint
npx tsc --noEmit
node scripts/verify-content.cjs
npm run build
```

执行 build 前先停止 dev（Ctrl+C），避免两者同时写入 `.next/`。静态产物在 `out/`。`npm run start` 是原模板的 Next 服务启动脚本，不适用于 `output: 'export'` 的静态产物；本地迭代使用 dev，静态验收使用普通文件服务器。

可选浏览器验收使用已有 Chrome，QA 工具不写入项目 package.json 或 lockfile：

```powershell
npm install --prefix .qa --no-save --package-lock=false --ignore-scripts --no-audit --no-fund playwright-core@1.56.1
node scripts/verify-browser.mjs
```

该脚本临时启动静态 HTTP 服务，检查已构建的 `out/`，结束时自动关闭服务与浏览器。截图和报告位于被 Git 忽略的 `.qa/`。

## 原始架构与本轮边界

- 基于 [PRISM](https://github.com/xyjoey/PRISM)，上游基线提交 `f2748db`。上游 README 中提到 Next.js 20，实际 package.json 与 lockfile 锁定 **Next.js 15.3.3**；没有升级依赖。
- `src/app/layout.tsx` 负责全局元数据、导航、主题与语言 provider；`src/app/page.tsx` 读取首页配置。
- `src/app/[slug]/page.tsx` 根据导航和 TOML 类型生成静态页面，仅开放确定的五个子页面。
- `src/lib/content.ts` 用 fs + smol-toml 读取内容，Markdown 用 react-markdown；`src/lib/bibtexParser.ts` 使用原有 bibtex-parse-js 与行内格式解析。
- 保留原版 Tailwind CSS 4、Georgia/系统衬线及无衬线体系、颜色、留白、断点、主题机制。英文粗体 Georgia 沿用上游字体 CDN，离线时使用 Georgia/系统字体回退。
- 保留原版 Zustand 语言/主题状态与 localStorage；固定初始语言为中文，之后记住手动选择。语言 provider 为静态 HTML 和首次水合提供配置默认值，避免首次生成英文内容。
- 保留 `output: 'export'`、`trailingSlash: true` 与原 Cloudflare Pages 静态部署方式；本轮仅本地运行，未注册 Sites、未部署、未 Commit/Push。
- 原版 LICENSE、README、部署文档、上游示例素材和未启用的 teaching/services 配置保留。教学、服务不是当前导航或导出页面，动态路由也拒绝访问。

## 六个页面与内容文件

`content/` 保留 PRISM 原生的英文基础内容；`content_zh/` 为对应中文内容。**内容目录默认回退语言与访客默认语言是两个概念**：访客默认中文由 `content/config.toml` 的 i18n 配置控制。除共享 BibTeX 外，两个目录具有相同文件名并逐一翻译，避免静默回退。

| 页面 | URL | 编辑文件（两个语言目录中） | 实现 |
| --- | --- | --- | --- |
| 关于我 | `/` | config.toml、about.toml、bio.md、research_interests.md、education.toml、selected_projects.toml、news.toml | 原首页；补全通用 cards section、照片占位和 CV 入口 |
| 论文 | `/publications/` | publications.toml；共享 publications.bib、citations.bib | 左图右文卡片，搜索筛选、完整摘要、资源链接和可复制引用 |
| 实习 | `/internships/` | internships.toml | 原 card 模板；增加可选 projects 子卡片与锚点 |
| 项目 | `/research_assistant/` | research_assistant.toml | 同上，真实岗位名称保留；导航已改名 |
| 奖项 | `/awards/` | awards.toml | 原 card 模板，entries 配置奖项名称与右侧日期 |
| 简历 | `/cv/` | cv.toml、cv.md | text 模板；金色 PDF 下载按钮、旧版提示与网页文字简历，无嵌入预览 |

原生卡片字段 title/subtitle/date/content/tags/link 保留；新增可选 `id` 和 `projects`。`projects` 下每项使用相同字段。首页教育、项目由 TOML cards section 读取，后续无需修改 React。

## 论文更新

展示数据编辑 `content/publications.bib`；引用数据编辑 `content/citations.bib`。中文目录同名文件只有说明注释；两种语言和首页均读取共享数据。不要在中文目录复制第二份记录。

- `status`：published、accepted、under-review、submitted、in-preparation、draft。缺失或无法识别的值按 draft 处理，避免误报已发表。
- `author_position`：first、co-first、second、third、fifth；后续若有不同排序，可扩展类型和字典。
- `year`：仅填写已确认年份；省略时显示“年份待确认”，不会自动填入当前年。
- `author`：确认后用标准 BibTeX 作者格式和 `and` 分隔，原版作者高亮继续有效。
- `selected = {true}` 控制首页精选；首页和列表不重复维护数据。
- `selected_order` 控制首页精选顺序；`abstract_excerpt` 为英文摘要首句，首页仅在超过两行时截断并追加三个点。两项自定义字段不写入导出的标准 BibTeX。
- `placeholder = {true}`：项目名/不完整书目占位，提示标题待确认并关闭 BibTeX 引用导出。核实完整记录后再移除。
- `type_pending = {true}`：类型待确认；目前 CiteVQA 已按用户更新为 ICLR 会议论文，移除了此标记。
- `pdf`、`code`、`project`、`hugging_face`、`demo`、`doi`：有真实链接时填写，否则省略；也兼容 pdfurl、project_url 和 url。
- `citation_key`：对应 `content/citations.bib` 的引用键；为会议展示信息与 arXiv 引用信息提供独立记录。
- 状态保留在数据中；当前论文页按用户要求采用平铺列表，不显示投稿状态分组。其他 publication 配置仍可启用 `group_by_status`。

## 照片、联系信息与 CV

- 目前已使用用户提供的白底照，资源路径为 `public/images/kong-jiahao.jpg`，两个 config.toml 的 `author.avatar` 均为 `/images/kong-jiahao.jpg`。页面通过 `object-cover object-[50%_25%]` 在正方形头像框中水平居中、纵向 25% 取景，减少头顶留白并多展示肩部，原始 `my_photo.jpg` 保留。后续更换头像时，替换资源或同步修改两份配置。
- Email/GitHub/Scholar 为空会隐藏；确认公开信息后填入配置。
- 已按用户指定将 `cv_version1.pdf` 作为试用版接入 **`public/files/CV.pdf`**，中英文共用。后续替换此文件即可；`cv.toml` 中 `[pdf] path = "/files/CV.pdf"` 已配置。
- PDF 文件在服务器渲染/构建时检查；加入文件后重启 dev 或重新 build。文件缺失时下载按钮禁用。简历页仅提供顶部金色下载按钮，下面以 Markdown 展示文字版，不嵌入 PDF，也不另设“打开 PDF”按钮。
- 中英文 `cv.md` 按旧 PDF 转写，网页版移除“拟录取”；`cv.toml` 中 `[notice]` 提供“需要更新简历”高亮。旧论文状态、作者排序与经历尚待用户后续更新，下载文件保持原样。
- 首页 CV 入口通向简历页，缺少 PDF 时也不会产生坏下载链接。

缺失资料与内容不确定项见 [CONTENT_TODO.md](CONTENT_TODO.md)。

## 本轮实际改动文件

- 两个内容目录均修改：`config.toml`、`about.toml`、`bio.md`、`news.toml`、`publications.toml`、`awards.toml`、`cv.toml`、`cv.md`。
- 两个内容目录均新增：`research_interests.md`、`education.toml`、`selected_projects.toml`、`internships.toml`、`research_assistant.toml`。
- `content/publications.bib` 维护 LayerRecall、GSA-YOLO、CiteVQA、TailProp 四篇论文；`content/citations.bib` 单独维护来源引用。中文目录中的同名文件仅作共享数据说明，不维护第二份论文数据。
- 路由与 SEO：`src/app/layout.tsx`、`src/app/page.tsx`、`src/app/[slug]/page.tsx`。
- 首页组件：`src/components/home/HomePageClient.tsx`、`Profile.tsx`、`SelectedPublications.tsx`。
- 页面组件：`src/components/pages/CardPage.tsx`、`DynamicPageClient.tsx`、`TextPage.tsx`；简历下载组件为 `PdfDownload.tsx`，已替换旧的 `PdfPreview.tsx`。
- 论文组件：`src/components/publications/PublicationsList.tsx`；新增图文卡片 `PublicationCard.tsx`、两行摘要预览 `TwoLineExcerpt.tsx`；原有 `PublicationDetails.tsx` 保留。
- 布局与语言：`src/components/layout/Navigation.tsx`、`Footer.tsx`；`src/components/ui/LocaleProvider.tsx`、`LanguageToggle.tsx`、`ThemeToggle.tsx`。主题及语言按钮修正了深色悬停时的对比度。
- 内容加载、解析与类型：`src/lib/config.ts`、`content.ts`、`bibtexParser.ts`、`src/lib/i18n/messages.ts`、`useMessages.ts`、`src/types/page.ts`、`publication.ts`。
- 静态资源：`public/favicon.svg` 改为 KJ；新增 `public/files/README.md` 说明 PDF 放置方法。
- 验证和交付：新增 `scripts/verify-content.cjs`、`scripts/verify-browser.mjs`、`CONTENT_TODO.md`、本文件；`.gitignore` 新增 `.qa/` 忽略规则。

未修改 package.json、package-lock.json、next.config.ts、全局 CSS、LICENSE 或上游 Git 历史。

## 第一阶段验证记录（2026-11-09）

- 原版 `npm run dev` 启动成功，首页 HTTP 200；个性化后六页均 HTTP 200。
- `npm run lint`：无警告或错误；`npx tsc --noEmit` 通过；最终 `npm run build` 完成类型检查、预渲染和静态导出。
- `node scripts/verify-content.cjs` 通过：双语文件与导航、共享 BibTeX、未知年份与状态处理、完整书目解析、CV 文件可用性检查。
- Chrome 浏览器验收覆盖全部六页的中英文内容、语言切换与刷新记忆、论文搜索/空结果/年份与类型筛选、投稿状态分组、真实锚点、缺失 CV 状态、深色模式及持久化、手机菜单跳转。
- 320、390、768、1024 像素视口下，两种语言的六页均无横向溢出；同时检查 1440 像素桌面布局。未捕获页面运行时或 React 水合错误。
- 已查看中文桌面首页、英文深色首页、中文手机实习页截图。截图与完整机器报告在 `.qa/`。
- 尚无正式简历文件：已验证缺失状态与文件存在性逻辑；实际个人 PDF 的内容与浏览器预览需在上传后核对。
- 未执行 Commit、Push、部署。验收使用的临时服务与无界面浏览器会自动关闭。

## 论文页验证记录（2026-11-15）

- `npm run build` 通过编译、Lint、类型检查与静态导出；`node scripts/verify-content.cjs` 通过。
- Chrome 完整验收通过中英文六页、论文顺序、四张图片、四篇完整摘要、BibTeX 面板与实际剪贴板内容、资源地址、搜索与筛选、主题切换及手机菜单；没有运行时错误。
- 最终检查确认深色资源按钮有清晰边界；展开摘要和引用后，320、390、768、1024 像素视口无横向溢出，摘要预览均不超过两行。
- 已查看最终中文深色桌面页、手机页、完整摘要和复制成功后的 BibTeX 截图，保存在 `.qa/`。内容来源差异记录于 `CONTENT_TODO.md`。
- 3000 端口的本地开发预览已恢复；未执行 Commit、Push、部署。
- 图片微调后已核对五张图片均正常加载，CiteVQA 双图纵向排列；桌面及 320、390、768、1024 像素视口均无横向溢出。

## 实习页验证与改动记录（2026-11-15）

- 修改内容文件：`content_zh/internships.toml`、`content/internships.toml`。
- 修改组件：`src/components/pages/CardPage.tsx`、`src/components/publications/PublicationCard.tsx`；新增共用组件 `src/components/ui/ResourceLink.tsx`。
- 修改类型与翻译：`src/types/page.ts`、`src/lib/i18n/messages.ts`；新增资源类型 `src/types/resource.ts`。
- 更新验证脚本：`scripts/verify-browser.mjs`；更新维护文档：`LOCAL_SETUP.md`、`CONTENT_TODO.md`。
- `node scripts/verify-content.cjs`、`npx tsc --noEmit`、`npm run build` 均通过；生产构建完成 Lint、类型检查与静态导出。
- 完整 Chrome 回归通过中英文六页、论文摘要与实际复制、五个实习项目、七个资源按钮、标题按钮对齐、原 CiteVQA 锚点点击跳转、主题切换和手机导航。
- 320、390、640、768、1024 像素视口下，两种语言的六页均无横向溢出；实习介绍均不超过四行，桌面五个标签全部在一行内显示。
- 六个外部资源地址实测 HTTP 200，包括 Demo、两份 PDF、两个 GitHub 仓库及 Hugging Face 模型页。MinerU 技术报告与模型卡均对应 arXiv:2604.04771。
- 已查看最终浅色桌面、深色桌面及中文手机实习页截图；截图和机器报告位于 `.qa/`。
- 不需要新增内容即可使用当前页面。两个在研项目后续可补充阶段性结果及可公开的资源链接。

## 科研项目、教育及介绍行数修正验证（2026-11-15）

- 更新中英文 `research_assistant.toml`、`education.toml`、`internships.toml`；新增 `ProjectDescription.tsx`，调整 `CardPage.tsx`、`types/page.ts` 与浏览器验证脚本。
- 先恢复实习内容，再完成科研项目；每个项目各自保留三至四行。中文桌面五个实习项目均为四行，科研项目 LayerRecall / CatBOX / GSA-YOLO 为四 / 四 / 三行。
- 对实习与科研项目的两种语言分别检查 320、390、500、640、768、900、1024、1440 像素窗口，共 32 种页面与窗口组合，全部项目均为三至四行，页面无横向溢出。
- 完整浏览器回归通过六页中英文、桌面单行标签、按钮对齐、LayerRecall / GSA-YOLO / CiteVQA 实际论文定位、教育条目、主题和手机菜单；没有页面运行时错误。
- 科研项目八个外部资源地址均可访问；沿用 SR 官方 PDF 地址和既有论文锚点。未添加 CatBOX 论文详情路由。
- 深色主题下，学军中学“技术选考生”为金黄色，“初中保送重高”为白色正文；已查看实际条目截图。
- `node scripts/verify-content.cjs`、类型检查及最终 `npm run build` 通过，静态导出成功。本地预览继续使用 3000 端口。

## 教育文字微调与奖项页验证（2026-11-15）

- 学军中学标题移除校区，说明改为“初中保送至杭州学军中学（西溪校区本部）”；教育三段正文统一颜色和常规字重，“专业排名：1/79”整行不加粗。
- 奖项页按用户顺序列出学业荣誉四条、竞赛奖项四条，日期独立靠右；中英文同步，旧占位数据已替换。
- 修改中英文 `education.toml` 和 `awards.toml`、`CardPage.tsx`、`types/page.ts`、浏览器脚本及维护文档；奖项行使用可选 `entries` 数据。
- 构建、类型与内容检查通过；浏览器直接验收 `out/` 静态导出版本，中英文六页、教育说明样式、奖项日期与右对齐、论文锚点、项目行数、主题和导航均通过。
- 320、390、640、768、1024 像素窗口均无横向溢出；已查看奖项页桌面、手机及新教育条目截图。
- 静态验证服务为 Next 导出的 `index.txt` 路由数据提供 `text/plain` 响应类型，支持正常客户端跳转；本地预览使用 3000 端口。
