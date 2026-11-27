import type { Publication, PublicationStatus, PublicationType } from '@/types/publication';

export interface LocaleMessages {
  common: {
    all: string;
    copyToClipboard: string;
    copied: string;
    copyFailed: string;
  };
  navigation: {
    openMainMenu: string;
  };
  theme: {
    system: string;
    light: string;
    dark: string;
    currentTheme: string;
    cycleTheme: string;
  };
  profile: {
    portraitPending: string;
    cv: string;
    email: string;
    location: string;
    workAddress: string;
    click: string;
    googleMap: string;
    send: string;
    sendEmail: string;
    researchInterests: string;
    like: string;
    liked: string;
    thanks: string;
  };
  home: {
    about: string;
    news: string;
    selectedPublications: string;
    viewAll: string;
  };
  publications: {
    publishedGroup: string;
    reviewGroup: string;
    otherGroup: string;
    yearPending: string;
    authorsPending: string;
    titlePending: string;
    authorPosition: string;
    positions: Record<NonNullable<Publication['authorPosition']>, string>;
    statuses: Record<PublicationStatus, string>;
    types: Record<PublicationType, string>;
    pdf: string;
    projectPage: string;
    searchPlaceholder: string;
    filters: string;
    year: string;
    type: string;
    noResults: string;
    abstract: string;
    bibtex: string;
    code: string;
    huggingFace: string;
    demo: string;
    viewFigure: string;
  };
  footer: {
    lastUpdated: string;
    builtWithPrism: string;
  };
  pages: { projects: string; inProgress: string; paperDetails: string; technologies: string };
  cv: { download: string; open: string; preview: string; pending: string; unavailable: string; fallback: string };
}

const en: LocaleMessages = {
  common: {
    all: 'All',
    copyToClipboard: 'Copy to clipboard',
    copied: 'Copied',
    copyFailed: 'Copy failed. Please select and copy the citation.',
  },
  navigation: {
    openMainMenu: 'Open main menu',
  },
  theme: {
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    currentTheme: 'Current theme',
    cycleTheme: 'Click to cycle theme',
  },
  profile: {
    portraitPending: 'Portrait to be added',
    cv: 'View CV',
    email: 'Email',
    location: 'Location',
    workAddress: 'Work Address',
    click: 'Click',
    googleMap: 'Google Map',
    send: 'Send',
    sendEmail: 'Send Email',
    researchInterests: 'Research Interests',
    like: 'Like',
    liked: 'Liked',
    thanks: 'Thanks!',
  },
  home: {
    about: 'About',
    news: 'News',
    selectedPublications: 'Selected Publications',
    viewAll: 'View All',
  },
  publications: {
    publishedGroup: 'Published',
    reviewGroup: 'Under Review / Submitted',
    otherGroup: 'Other Research',
    yearPending: 'Year to confirm',
    authorsPending: 'Full author list to be added',
    titlePending: 'Project name · Full paper title to confirm',
    authorPosition: 'My author position',
    positions: { first: 'First Author', 'co-first': 'Co-first Author', second: 'Second Author', third: 'Third Author', fifth: 'Fifth Author' },
    statuses: { published: 'Published', accepted: 'Accepted', 'under-review': 'Under Review', submitted: 'Submitted', 'in-preparation': 'In Preparation', draft: 'Draft' },
    types: { journal: 'Journal', conference: 'Conference', workshop: 'Workshop', 'book-chapter': 'Book Chapter', book: 'Book', thesis: 'Thesis', preprint: 'Preprint', patent: 'Patent', 'technical-report': 'Technical Report', unconfirmed: 'Type to confirm' },
    pdf: 'PDF',
    projectPage: 'Project Page',
    searchPlaceholder: 'Search publications...',
    filters: 'Filters',
    year: 'Year',
    type: 'Type',
    noResults: 'No publications found matching your criteria.',
    abstract: 'Abstract',
    bibtex: 'BibTeX',
    code: 'Code',
    huggingFace: 'Hugging Face',
    demo: 'Demo',
    viewFigure: 'View full-size figure',
  },
  footer: {
    lastUpdated: 'Last updated',
    builtWithPrism: 'Built with PRISM',
  },
  pages: { projects: 'Projects', inProgress: 'In progress', paperDetails: 'Paper details', technologies: 'Technologies' },
  cv: { download: 'Download PDF', open: 'Open PDF', preview: 'CV preview', pending: 'CV coming soon', unavailable: 'The verified PDF résumé will be added here.', fallback: 'If the preview is unavailable in your browser, open or download the PDF.' },
};

const zh: LocaleMessages = {
  common: {
    all: '全部',
    copyToClipboard: '复制到剪贴板',
    copied: '已复制',
    copyFailed: '复制失败，请选中文本后手动复制。',
  },
  navigation: {
    openMainMenu: '打开主菜单',
  },
  theme: {
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    currentTheme: '当前主题',
    cycleTheme: '点击切换主题',
  },
  profile: {
    portraitPending: '正式照片待补充',
    cv: '查看简历',
    email: '邮箱',
    location: '地址',
    workAddress: '办公地址',
    click: '点击',
    googleMap: '谷歌地图',
    send: '发送',
    sendEmail: '发送邮件',
    researchInterests: '研究兴趣',
    like: '点赞',
    liked: '已点赞',
    thanks: '感谢支持！',
  },
  home: {
    about: '关于我',
    news: '动态',
    selectedPublications: '精选论文',
    viewAll: '查看全部',
  },
  publications: {
    publishedGroup: '已发表 / Published',
    reviewGroup: '在审 / 已投稿',
    otherGroup: '其他研究',
    yearPending: '年份待确认',
    authorsPending: '完整作者名单待补充',
    titlePending: '项目名称占位 · 正式论文标题待确认',
    authorPosition: '本人作者排序',
    positions: { first: '第一作者', 'co-first': '共同第一作者', second: '第二作者', third: '第三作者', fifth: '第五作者' },
    statuses: { published: '已发表', accepted: '已录用', 'under-review': '在审', submitted: '已投稿', 'in-preparation': '准备中', draft: '草稿' },
    types: { journal: '期刊论文', conference: '会议论文', workshop: '研讨会论文', 'book-chapter': '书籍章节', book: '专著', thesis: '学位论文', preprint: '预印本', patent: '专利', 'technical-report': '技术报告', unconfirmed: '类型待确认' },
    pdf: 'PDF',
    projectPage: '项目主页',
    searchPlaceholder: '搜索论文...',
    filters: '筛选',
    year: '年份',
    type: '类型',
    noResults: '没有找到符合条件的论文。',
    abstract: '摘要',
    bibtex: 'BibTeX',
    code: '代码',
    huggingFace: 'Hugging Face',
    demo: 'Demo',
    viewFigure: '查看原尺寸关键图',
  },
  footer: {
    lastUpdated: '最近更新',
    builtWithPrism: '由 PRISM 构建',
  },
  pages: { projects: '参与项目', inProgress: '进行中', paperDetails: '论文详情', technologies: '技术栈' },
  cv: { download: '下载 PDF', open: '打开 PDF', preview: '简历预览', pending: '简历待补充', unavailable: '正式简历 PDF 提供后将在此展示。', fallback: '如果浏览器无法显示预览，请打开或下载 PDF。' },
};

export const messages: Record<string, LocaleMessages> = {
  en,
  zh,
};

export function getMessages(locale: string): LocaleMessages {
  return messages[locale] || en;
}
