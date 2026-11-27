# 孔嘉浩 · 内容核对清单

更新日期：2026-11-16。首页、四篇论文、五个实习项目、三个高校科研项目及奖项页已完成定制，教育经历已按最新文案统一；用户提供的简历试用版已接入。内容继续使用 TOML、Markdown 与共享 BibTeX 管理。

## 已完成的首页信息

- [x] 中文姓名孔嘉浩、英文姓名 Jiahao Kong；身份显示硕士研究生、北京大学，移除待入学、预计入学及 AI Research & Engineering 展示行。
- [x] 用户白底照接入中英文首页，水平居中、纵向 25% 取景，原始 my_photo.jpg 保留。
- [x] 公开邮箱 jiahao_kong@163.com，点击图标显示浮窗与“发送”链接；ORCID 与 GitHub 为用户提供的真实链接。
- [x] 简介按学术背景、研究兴趣、科研助理经历和实习经历分为四段；导师占位已恢复并高亮。实验室仅显示学校名与英文简称。
- [x] 四个方向：多模态学习与后训练、生成式模型、智能体与强化学习、决策模型。
- [x] 北大教育时间 2027.09–2029.06，不再附预计；描述为“推荐免试攻读硕士研究生”。本科首页只显示“专业排名：1/79”，删除 GPA 与百分比。其他页面的数据未作本轮重写。
- [x] 导航“科研助理”改为“项目”，原 URL /research_assistant 与文件名保留；删除重复的页面下拉框，恢复原生窄屏菜单。
- [x] 首页论文顺序 LayerRecall、GSA-YOLO、CiteVQA；全部英文，Jiahao Kong 金色标记；显示作者、完整会议或期刊名称、年份；摘要首句最多两行，仅超出时截断加三个点；首页不显示投稿状态标签。
- [x] 首页项目顺序 MinerU-2.5pro（上海人工智能实验室）、DeepFake Red Team Attacker（网易）、DeepTrace（网易）。FocusRL 不再显示，DeepTrace 待补充内容加粗并高亮。
- [x] 八条动态按 2026-12、11、10、09、06、05、03、01 倒序；2026-11 与 2026-12 的接收动态高亮，作为后续核对项。2026-12 为当前日期之后的内容占位，不据其自动确认 CiteVQA 已接收。

## 论文资料与来源

页面数据使用 content/publications.bib，两种语言及首页共用。标准引用单独存放于 content/citations.bib，通过 citation_key 对应；PDF、代码、Project Page、Hugging Face、Demo 均只在配置了链接时显示。

| 论文 | 本次确认的内容 | 原文来源 |
| --- | --- | --- |
| LayerRecall | 完整标题与 5 位作者；Jiahao Kong 为第二作者，Ruijie Quan 带 *；AAAI 2027；录用消息由用户提供；摘要首句已核对 | [arXiv](https://arxiv.org/abs/2608.28460) |
| GSA-YOLO | 完整标题；按用户最新更正为 Jiahao Kong、Chengyou Wang*；Scientific Reports 16, 25404 (2026)；DOI；官方 PDF 摘要首句 | 最新作者更正来自用户；期刊与摘要来源：[DOI](https://doi.org/10.1038/s41598-026-55599-2)、[出版社 PDF](https://www.nature.com/articles/s41598-026-55599-2.pdf)、[PMC 正式全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC13473521/) |
| CiteVQA | 完整标题与 12 位作者；Jiahao Kong 为第五作者；Conghui He* 按用户更新标为通讯作者；采用 ICLR 2027；摘要首句已核对；BibTeX 仍保留在审状态 | [arXiv](https://arxiv.org/abs/2605.12882)，通讯作者标记来自用户 |
| TailProp | Jiahao Kong、Zihan Li；展示为 CVPR 2027，预印本引用为 2026；完整摘要与首句来自 arXiv；不加入首页精选 | [arXiv](https://arxiv.org/abs/2609.11081) |

会议全称来源：[AAAI 2027](https://aaai.org/conference/aaai/aaai-27/)、[ICLR 2027](https://iclr.cc/Conferences/2027)。

GSA-YOLO 官方 PDF 已下载至被 Git 忽略的 .qa/gsa-yolo-publisher.pdf，并用 pdfminer 提取首页，核对摘要开头；不是参考稿 PDF。发表日期为 2026-06-04，接收日期为 2026-05-26，与 2026-05 的接收动态对应。

四篇完整摘要已从 arXiv / 官方 PDF 整理至 abstract 字段；摘要展开不受两行限制，预览只展示首句并最多两行。CiteVQA 摘要中的仓库链接已还原为实际网址，TailProp 的简单复杂度公式使用便于网页阅读的纯文本写法。

GSA-YOLO 官方 DOI 导出的引用只包含 Jiahao Kong，与用户指定的双作者展示信息不同：页面保留双作者，引用保留官方原样。TailProp 的 arXiv 注释仍写 ICLR 2027，页面 venue 按用户本次指示使用 CVPR 2027；未据此推断已录用。

五张关键图均已放入 public/papers/，保留原图；LayerRecall、TailProp 的图片略微纵向拉伸以减少上下留白，CiteVQA 两张图片纵向排列；资源入口按用户提供的链接配置。CatBOX 不再出现在论文页，原有项目条目保留，移除了失效的论文页锚点。

原先 CiteVQA venue 待确认、第三作者及 LayerRecall 共同一作等占位已由本次资料替换，不再按旧规则回退。学位展示按用户本次已录取后的表述更新。

## 已完成的实习页内容

- 网易智企事业部：2026.10 — 至今，人工智能算法实习生。保留公司卡片，删除“易盾”后缀及原占位说明。
- DeepFake Red Team Attacker：LangGraph / CLIP / Source–Target 生成与筛选流程，约 6,000 条样本，业务 Fake 检出率提升 2.8%；标题右侧提供 Demo。
- DeepTrace：证据定位、跨分支核验、弱监督与 LoRA / QLoRA SFT，使用进行中高亮。
- DeepFake Decision Model：Intern-Decision 2B / 4B 领域适配与 Decision SFT，后续 OOD 和 BBox 评测，使用进行中高亮。
- 上海人工智能实验室：2026.03 — 2026.06，多模态大模型算法实习生。
- MinerU2.5-Pro：数据筛选、SFT→GRPO、MGAM 和奖励设计，3.9M / 192K 样本，OmniDocBench 95.69、提升 2.71；提供 PDF、代码及 Hugging Face。
- CiteVQA：数据 Pipeline、轨迹蒸馏、3K / 5K 对照训练、711 PDF / 1,897 QA 基准和 20 款 MLLM 评测；提供 PDF、代码及原有论文卡片详情锚点。
- 中英文内容同步；每个项目分别显示三至四行完整介绍，按实际窗口宽度选择最充实的改写，避免窄窗口出现一至两行的过短摘要；每项五个技术标签，保持单行。论文、实习与科研项目页共用原论文按钮组件。

## 已完成的高校项目与教育经历更新

- 项目页说明改为“我在各高校担任科研助理时参与的项目如下。”，三个岗位均已中文化，学校标题补充实验室简称，删除重复的实验室中文全称。
- LayerRecall：状态条件记忆路由、Attention Profiling、CHPM、跨骨干验证；100 个提示词上的 0.548 / 0.579 / 0.978 结果按用户提供内容展示；增加五个资源按钮及原论文卡片详情。
- CatBOX：CSM+GSM 核推导实现、混合变量优化及催化反应评测，3 倍以上与约 19 倍改进；配置 arXiv:2505.17393 与官方代码，论文列表不新增 CatBOX。
- GSA-YOLO：软稀疏、硬剪枝与自适应蒸馏，精度提升 2.4% / 1.8%，推理速度提升 11.2%；配置 SR PDF、代码及原论文详情。
- 首页教育条目为“杭州学军中学”，2020.09–2023.06，“技术选考生”为黄色，正文改为“初中保送至杭州学军中学（西溪校区本部）”；与北大、山大说明统一颜色和常规字重，“专业排名：1/79”整行不加粗。中英文同步。

## 已完成的奖项页

- 页面介绍为“我获得的学业荣誉与竞赛奖项”，保留“学业荣誉”“竞赛奖项”两张卡片，日期右对齐。
- 学业荣誉：2023-2024 学年本科生国家奖学金（2024.12）、2024-2025 学年本科生国家奖学金（2025.12）、山东大学优秀学生奖一等（2024.11）、山东大学三好学生（2025.11）。
- 竞赛奖项按用户指定顺序：电工数学建模国家级一等奖（2025.07）、世界机器人大赛锦标赛 VEX 赛项国家级一等奖（2021.09）、全国大学生数学竞赛国家级二等奖（2024.12）、蓝桥杯程序设计国家级三等奖（2026.05）。
- 旧 GPA、专业排名、数学建模省级一等奖与蓝桥杯省级二等奖展示已移除；中英文内容对应。

## 仍需补充

- [ ] 北大导师姓名与主页链接；当前“导师为【待补充】”已高亮，待替换。
- [ ] Google Scholar 链接。
- [ ] 后续更新正式简历；当前下载仍为 `cv_version1.pdf`，网站资源为 `public/files/CV.pdf`。中英文 `cv.md` 转写旧版正文并移除“拟录取”，页面顶部金色下载按钮下显示“需要更新简历”高亮；不再嵌入 PDF。正文中的论文状态、作者排序与经历也属于待更新范围。
- [ ] 后续核对 GSA-YOLO 官方引用与页面展示作者的差异。
- [ ] 后续核对 TailProp 原文与页面展示 venue 的差异。
- [ ] LayerRecall 后续正式 proceedings 链接、CiteVQA 后续准确接收状态。
- [ ] DeepTrace 和 DeepFake Decision Model 后续阶段性结果、可公开的代码或展示链接。
- [ ] 核对并定稿高亮的 2026-11、2026-12 两条动态，尤其后者的时间和录用状态。
- [ ] 三个精选项目及各机构经历中允许公开的具体贡献和配图。
- [x] 用户已确认个人主页发布地址为 `https://kjhkong.github.io/`，使用 `KJHkong/KJHkong.github.io` 与 GitHub Actions 自动部署；不改动 GitHub 账号名称。

不公开私人手机号、微信号；网易相关描述仅使用已获用户授权的概述。

## 后续顺序

后续补充正式简历及剩余材料，并按进度更新两个在研项目。内容更新保留中英文对应结构。未经用户授权不 Commit、Push 或上线。

本地启动与维护说明见 [LOCAL_SETUP.md](LOCAL_SETUP.md)。
