import { Publication, PublicationStatus, PublicationType, ResearchArea } from '@/types/publication';
import { getConfig } from './config';
import { getRuntimeI18nConfig } from './i18n/config';
import { parseBibTeXInline } from './bibtexInline';
import { getBibtexContent } from './content';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bibtexParse = require('bibtex-parse-js');

interface BibtexEntry { entryType: string; citationKey: string; entryTags: Record<string, string> }

// Map BibTeX entry types to our publication types
const typeMapping: Record<string, PublicationType> = {
  article: 'journal',
  inproceedings: 'conference',
  conference: 'conference',
  incollection: 'book-chapter',
  book: 'book',
  phdthesis: 'thesis',
  mastersthesis: 'thesis',
  techreport: 'technical-report',
  unpublished: 'preprint',
  misc: 'preprint',
};

// Convert month names to numbers
const monthMapping: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9, sept: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function parseBibTeX(bibtexContent: string, locale?: string): Publication[] {
  const highlightNames = getHighlightNames(locale);
  const entries: BibtexEntry[] = bibtexParse.toJSON(bibtexContent);
  const sourceCitations: BibtexEntry[] = entries.some(entry => entry.entryTags.citation_key)
    ? bibtexParse.toJSON(getBibtexContent('citations.bib')) : [];

  return entries.map((entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, index: number) => {
    const tags = entry.entryTags;

    // Parse authors
    const authors = parseAuthors(tags.author || '', highlightNames);

    // Parse year and month
    const parsedYear = Number(tags.year);
    const year = Number.isInteger(parsedYear) && parsedYear > 0 ? parsedYear : undefined;
    const monthStr = tags.month?.toLowerCase() || '';
    const month = monthMapping[monthStr] || (parseInt(monthStr) || undefined);

    // Determine type
    const type = tags.type_pending === 'true' ? 'unconfirmed' : (typeMapping[entry.entryType.toLowerCase()] || 'preprint');
    const statuses: PublicationStatus[] = ['published', 'accepted', 'under-review', 'submitted', 'in-preparation', 'draft'];
    const status = statuses.includes(tags.status as PublicationStatus) ? tags.status as PublicationStatus : 'draft';
    const authorPositions = ['first', 'co-first', 'second', 'third', 'fifth'];

    // Parse tags/keywords
    const keywords = tags.keywords?.split(',').map((k: string) => k.trim()) || [];

    // Parse selected field (convert string to boolean)
    const selected = tags.selected === 'true' || tags.selected === 'yes';

    // Parse preview field (remove braces if present)
    const preview = tags.preview?.replace(/[{}]/g, '');
    const title = parseBibTeXInline(tags.title || 'Untitled');
    const sourceCitation = sourceCitations.find(citation => citation.citationKey === tags.citation_key);

    // Create publication object
    const publication: Publication = {
      id: entry.citationKey || tags.id || `pub-${Date.now()}-${index}`,
      title: title.plainText || 'Untitled',
      titleNodes: title.nodes,
      authors,
      year,
      month: monthMapping[tags.month?.toLowerCase()] ? String(month) : tags.month,
      type,
      status,
      placeholder: tags.placeholder === 'true',
      authorPosition: authorPositions.includes(tags.author_position) ? tags.author_position as Publication['authorPosition'] : undefined,
      selectedOrder: tags.selected_order && Number.isFinite(Number(tags.selected_order)) ? Number(tags.selected_order) : undefined,
      tags: keywords,
      keywords,
      researchArea: detectResearchArea(tags.title, keywords),

      // Optional fields
      journal: cleanBibTeXString(tags.journal),
      conference: cleanBibTeXString(tags.booktitle),
      volume: tags.volume,
      issue: tags.number,
      pages: tags.pages,
      doi: tags.doi,
      url: tags.url,
      code: tags.code,
      pdfUrl: tags.pdf || tags.pdfurl,
      projectPage: tags.project || tags.project_url,
      huggingFace: tags.hugging_face,
      demo: tags.demo,
      venue: cleanBibTeXString(tags.venue),
      abstract: cleanBibTeXString(tags.abstract),
      summary: cleanBibTeXString(tags.abstract_excerpt),
      description: cleanBibTeXString(tags.description || tags.note),
      selected,
      preview,
      additionalPreviews: tags.preview_additional?.split(',').map(path => path.trim().replace(/[{}]/g, '')).filter(Boolean),
      previewFit: tags.preview_fit === 'fill' ? 'fill' : undefined,

      // Store original BibTeX (excluding custom fields)
      bibtex: sourceCitation ? reconstructBibTeX(sourceCitation) : tags.placeholder === 'true' ? undefined : reconstructBibTeX(entry, ['selected', 'selected_order', 'abstract_excerpt', 'preview', 'preview_additional', 'preview_fit', 'description', 'keywords', 'code', 'status', 'author_position', 'placeholder', 'type_pending', 'pdf', 'pdfurl', 'project', 'project_url', 'venue', 'citation_key', 'hugging_face', 'demo']),
    };

    // Clean up undefined fields
    Object.keys(publication).forEach(key => {
      if (publication[key as keyof Publication] === undefined) {
        delete publication[key as keyof Publication];
      }
    });

    return publication;
  }).sort((a: Publication, b: Publication) => {
    // Sort by year (descending), then by month if available
    if (b.year !== a.year) return (b.year || 0) - (a.year || 0);

    // For month comparison, treat missing months as January (1) to ensure they appear last within the year
    const monthA = typeof a.month === 'string' ?
      (monthMapping[a.month.toLowerCase()] || parseInt(a.month) || 1) :
      (a.month || 1);
    const monthB = typeof b.month === 'string' ?
      (monthMapping[b.month.toLowerCase()] || parseInt(b.month) || 1) :
      (b.month || 1);

    // Sort by month descending (December to January)
    return monthB - monthA;
  });
}

function getHighlightNames(locale?: string): string[] {
  const names = new Set<string>();
  const baseConfig = getConfig();
  const runtimeI18n = getRuntimeI18nConfig(baseConfig.i18n);

  const addName = (name?: string) => {
    const cleaned = cleanBibTeXString(name).trim();
    if (cleaned) {
      names.add(cleaned);
    }
  };

  addName(baseConfig.author.name);

  if (runtimeI18n.enabled) {
    runtimeI18n.locales.forEach((localeCode) => {
      const localizedConfig = getConfig(localeCode);
      addName(localizedConfig.author.name);
    });
  }

  if (locale) {
    const currentLocaleConfig = getConfig(locale);
    addName(currentLocaleConfig.author.name);
  }

  return Array.from(names);
}

function normalizePersonNameForMatch(name: string): string {
  return name.toLowerCase().replace(/[\s.,'’`"()\-_/]/g, '');
}

function buildNameVariants(name: string): Set<string> {
  const variants = new Set<string>();
  const cleaned = cleanBibTeXString(name).toLowerCase().trim();

  if (!cleaned) {
    return variants;
  }

  variants.add(cleaned);

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 2) {
    variants.add(`${parts[1]} ${parts[0]}`);
  }

  return variants;
}

function parseAuthors(authorsStr: string, highlightNames: string[]): Array<{ name: string; isHighlighted?: boolean; isCorresponding?: boolean; isCoAuthor?: boolean }> {
  if (!authorsStr) return [];

  const highlightTextCandidates = new Set<string>();
  const highlightNormalizedCandidates = new Set<string>();

  highlightNames.forEach((name) => {
    const variants = buildNameVariants(name);
    variants.forEach((variant) => {
      highlightTextCandidates.add(variant);
      highlightNormalizedCandidates.add(normalizePersonNameForMatch(variant));
    });
  });

  const highlightTextList = Array.from(highlightTextCandidates);
  const highlightNormalizedList = Array.from(highlightNormalizedCandidates);

  // Split by "and" and clean up
  return authorsStr
    .split(/\sand\s/)
    .map(author => {
      // Clean up the author name
      let name = author.trim();

      // Check for corresponding author marker
      const isCorresponding = name.includes('*');

      // Check for co-author marker (#)
      const isCoAuthor = name.includes('#');

      // Remove special markers from name
      name = name.replace(/[*#]/g, '');

      // Handle "Last, First" format
      if (name.includes(',')) {
        const parts = name.split(',').map(p => p.trim());
        name = `${parts[1]} ${parts[0]}`;
      }

      name = cleanBibTeXString(name);

      // Check if this is the site owner (to highlight)
      const lowerName = name.toLowerCase();
      const normalizedName = normalizePersonNameForMatch(lowerName);
      const isHighlighted =
        highlightTextList.some((candidate) => lowerName.includes(candidate)) ||
        highlightNormalizedList.some((candidate) => normalizedName.includes(candidate));

      return {
        name,
        isHighlighted,
        isCorresponding,
        isCoAuthor,
      };
    })
    .filter(author => author.name);
}

function cleanBibTeXString(str?: string): string {
  if (!str) return '';

  return parseBibTeXInline(str).plainText;
}

function detectResearchArea(title: string, keywords: string[]): ResearchArea {
  const text = (title + ' ' + keywords.join(' ')).toLowerCase();

  if (text.includes('healthcare') || text.includes('medical') || text.includes('health')) {
    return 'ai-healthcare';
  }
  if (text.includes('signal') || text.includes('processing')) {
    return 'signal-processing';
  }
  if (text.includes('reliability') || text.includes('fault') || text.includes('diagnosis')) {
    return 'reliability-engineering';
  }
  if (text.includes('quantum')) {
    return 'quantum-computing';
  }
  if (text.includes('neural') || text.includes('spiking')) {
    return 'neural-networks';
  }
  if (text.includes('transformer') || text.includes('attention')) {
    return 'transformer-architectures';
  }

  return 'machine-learning';
}

function reconstructBibTeX(entry: { entryType: string; citationKey: string; entryTags: Record<string, string> }, excludeFields: string[] = []): string {
  const { entryType, citationKey, entryTags } = entry;

  let bibtex = `@${entryType}{${citationKey},\n`;

  Object.entries(entryTags).forEach(([key, value]) => {
    // Skip excluded fields
    if (!excludeFields.includes(key.toLowerCase())) {
      let cleanValue = value;

      // Clean author field by removing # and * symbols
      if (key.toLowerCase() === 'author') {
        cleanValue = value.replace(/[#*]/g, '');
      }

      bibtex += `  ${key} = {${cleanValue}},\n`;
    }
  });

  // Remove trailing comma and newline
  bibtex = bibtex.slice(0, -2) + '\n';
  bibtex += '}';

  return bibtex;
} 
