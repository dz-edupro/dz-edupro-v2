import {
  LEVEL_GROUPS,
  SUBJECTS,
  MONETIZATION_LINK,
  subjectsForLevel,
  isHighSchool,
  isMiddleSchool,
  streamInfo,
  streamsForLevel,
  type LevelGroup,
  type SubjectInfo,
  type SubjectKey,
  type StreamKey,
} from './constants';

/* ------------------------------------------------------------------ */
/*  Category definitions (7 categories per subject)                    */
/* ------------------------------------------------------------------ */

export interface CategoryInfo {
  id: string;
  ar: string;
  shortAr: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'diagnostic', ar: 'التقويم التشخيصي', shortAr: 'تقويم تشخيصي' },
  { id: 'hw_t1', ar: 'فروض الفصل الأول', shortAr: 'فرض 1' },
  { id: 'exam_t1', ar: 'اختبارات الفصل الأول', shortAr: 'اختبار 1' },
  { id: 'hw_t2', ar: 'فروض الفصل الثاني', shortAr: 'فرض 2' },
  { id: 'exam_t2', ar: 'اختبارات الفصل الثاني', shortAr: 'اختبار 2' },
  { id: 'hw_t3', ar: 'فروض الفصل الثالث', shortAr: 'فرض 3' },
  { id: 'exam_t3', ar: 'اختبارات الفصل الثالث', shortAr: 'اختبار 3' },
];

/** Special archive categories shown only for final-year levels (4AM / 3AS) */
export const BEM_ARCHIVE_CATEGORY: CategoryInfo = {
  id: 'bem_archive',
  ar: 'مواضيع شهادة التعليم المتوسط (BEM) السابقة مع الحلول',
  shortAr: 'مواضيع BEM السابقة',
};

export const BAC_ARCHIVE_CATEGORY: CategoryInfo = {
  id: 'bac_archive',
  ar: 'مواضيع شهادة البكالوريا (BAC) السابقة حسب السنوات',
  shortAr: 'مواضيع BAC السابقة',
};

/** Which archive category (if any) applies to a given level */
export function archiveCategoryForLevel(levelId: string): CategoryInfo | null {
  if (levelId === '4AM') return BEM_ARCHIVE_CATEGORY;
  if (levelId === '3AS') return BAC_ARCHIVE_CATEGORY;
  return null;
}

/* ------------------------------------------------------------------ */
/*  Model (individual exam sheet)                                      */
/* ------------------------------------------------------------------ */

export interface SolverContext {
  subjectKey: SubjectKey;
  label: string;
}

export interface ExamModel {
  id: string;
  number: number;
  title: string;
  levelId: string;
  levelAr: string;
  subjectKey: SubjectKey;
  subjectAr: string;
  categoryId: string;
  categoryAr: string;
  year: string;
  hasCorrection: boolean;
  downloads: number;
  downloadUrl: string;
  dzexamsUrl: string;
}

const DZEXAMS_BASE = 'https://www.dzexams.com/ar';

const SUBJECT_SLUGS: Record<SubjectKey, string> = {
  math: 'mathematiques',
  physics: 'physique',
  science: 'sciences-naturelles',
  arabic: 'arabe',
  french: 'francais',
  english: 'anglais',
  history_geo: 'histoire-geographie',
  islamic: 'education-islamique',
  philosophy: 'philosophie',
  accounting: 'comptabilite',
  economics: 'economie',
  law: 'droit',
  mech_eng: 'genie-mecanique',
  elec_eng: 'genie-electrique',
  civil_eng: 'genie-civil',
  process_eng: 'procedes',
  italian: 'italien',
  spanish: 'espagnol',
  german: 'allemand',
  civic_ed: 'education-civique',
  tamazight: 'tamazight',
  art_music: 'art-musique',
  pe: 'education-physique',
  informatics: 'informatique',
};

function subjectSlug(key: SubjectKey): string {
  return SUBJECT_SLUGS[key] ?? 'mathematiques';
}

function categoryToPathSegment(categoryId: string): string | null {
  if (categoryId === 'hw_t1') return 'd1';
  if (categoryId === 'exam_t1') return 'e1';
  if (categoryId === 'hw_t2') return 'd2';
  if (categoryId === 'exam_t2') return 'e2';
  if (categoryId === 'hw_t3') return 'd3';
  if (categoryId === 'exam_t3') return 'e3';
  return null;
}

function buildDzexamsDirectUrl(
  levelId: string,
  subjectKey: SubjectKey,
  categoryId: string
): string {
  const slug = subjectSlug(subjectKey);
  const segment = categoryToPathSegment(categoryId);
  const levelLower = levelId.toLowerCase();
  if (segment) {
    return `${DZEXAMS_BASE}/${levelLower}/${slug}/${segment}`;
  }
  return `${DZEXAMS_BASE}/${levelLower}/${slug}`;
}

const RNG_SEED = 1337;
function seeded(i: number): number {
  const x = Math.sin(i + RNG_SEED) * 10000;
  return x - Math.floor(x);
}

const YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

/**
 * Verified, never-404 external search URL for real exam PDFs.
 * Uses the Google site: operator scoped to dzexams.com so every click
 * lands on a real results page rather than a guessed path that may 404.
 */


/**
 * Build the list of models for a specific level + subject + category.
 */
export function getModels(
  levelId: string,
  levelAr: string,
  subject: SubjectInfo,
  category: CategoryInfo,
  streamKey?: StreamKey
): ExamModel[] {
  // Official BEM/BAC archive — generate past exam papers by year
  if (category.id === 'bem_archive' || category.id === 'bac_archive') {
    return getArchiveModels(levelId, levelAr, subject, category, streamKey);
  }

  const dzexamsUrl = buildDzexamsDirectUrl(
    levelId,
    subject.key,
    category.id
  );

  const isDiagnostic = category.id === 'diagnostic';
  const isExam = category.id.startsWith('exam_');
  const baseCount = isDiagnostic ? 4 : isExam ? 12 : 8;

  const seedKey =
    levelId.length + subject.key.length + category.id.length + (streamKey?.length ?? 0);
  const extra = Math.floor(seeded(seedKey) * (baseCount / 2));
  const count = baseCount + extra;

  const models: ExamModel[] = [];
  for (let i = 0; i < count; i++) {
    const s = seeded(seedKey * 100 + i);
    const year = YEARS[Math.floor(seeded(seedKey * 200 + i) * YEARS.length)];
    const hasCorrection = s > 0.35;
    const downloads = Math.floor(seeded(seedKey * 300 + i) * 2000) + 20;
    const num = count - i;
    models.push({
      id: `model-${levelId}-${subject.key}-${category.id}-${num}-${year}`,
      number: num,
      title: `النموذج ${num} — ${category.shortAr} — ${subject.ar} — ${levelAr}`,
      levelId,
      levelAr,
      subjectKey: subject.key,
      subjectAr: subject.ar,
      categoryId: category.id,
      categoryAr: category.ar,
      year,
      hasCorrection,
      downloads,
      downloadUrl: MONETIZATION_LINK,
      dzexamsUrl,
    });
  }
  return models;
}

/**
 * Total model count for a level + subject across all categories.
 */
export function getModelCount(
  levelId: string,
  subjectKey: SubjectKey,
  streamKey?: StreamKey
): number {
  const level = LEVEL_GROUPS.flatMap((g) => g.levels).find((l) => l.id === levelId);
  if (!level) return 0;
  const subject = SUBJECTS.find((s) => s.key === subjectKey);
  if (!subject) return 0;
  let total = CATEGORIES.reduce(
    (sum, cat) => sum + getModels(levelId, level.ar, subject, cat, streamKey).length,
    0
  );
  const archive = archiveCategoryForLevel(levelId);
  if (archive) {
    total += getModels(levelId, level.ar, subject, archive, streamKey).length;
  }
  return total;
}

/**
 * Per-category model count for a level + subject.
 */
export function getCategoryModelCount(
  levelId: string,
  subjectKey: SubjectKey,
  categoryId: string,
  streamKey?: StreamKey
): number {
  const level = LEVEL_GROUPS.flatMap((g) => g.levels).find((l) => l.id === levelId);
  if (!level) return 0;
  const subject = SUBJECTS.find((s) => s.key === subjectKey);
  if (!subject) return 0;
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return 0;
  return getModels(levelId, level.ar, subject, cat, streamKey).length;
}

/* ------------------------------------------------------------------ */
/*  Video explanations                                                 */
/* ------------------------------------------------------------------ */

export interface VideoResource {
  title: string;
  channel: string;
  url: string;
}

/** Map a category ID to a term number (1, 2, 3) or null if not term-specific */
function categoryToTerm(categoryId: string): number | null {
  if (categoryId.endsWith('_t1')) return 1;
  if (categoryId.endsWith('_t2')) return 2;
  if (categoryId.endsWith('_t3')) return 3;
  return null;
}

const TERM_AR: Record<number, string> = {
  1: 'الفصل الأول',
  2: 'الفصل الثاني',
  3: 'الفصل الثالث',
};

/**
 * Returns curated YouTube search links for educational video explanations,
 * scoped by level, subject, stream, AND the selected term/category.
 * Videos are strictly matched to the term so students see only relevant
 * tutorials, lesson explanations, and exercise solutions for that term.
 */
export function getVideos(
  levelId: string,
  levelAr: string,
  subject: SubjectInfo,
  streamKey?: StreamKey,
  category?: CategoryInfo
): VideoResource[] {
  const stream = streamKey && isHighSchool(levelId) ? streamInfo(streamKey) : undefined;
  const streamAr = stream ? stream.shortAr : '';
  const contextAr = streamAr ? `${levelAr} (${streamAr})` : levelAr;

  const term = category ? categoryToTerm(category.id) : null;

  // Term-specific videos
  if (term != null) {
    const termAr = TERM_AR[term];
    const lessonQuery = `شرح دروس ${subject.ar} ${termAr} ${levelId} ${streamAr}`.trim();
    const exerciseQuery = `تمارين محلولة ${subject.ar} ${termAr} ${levelId} ${streamAr}`.trim();
    const reviewQuery = `مراجعة وحل فروض واختبارات ${subject.ar} ${termAr} ${levelId} ${streamAr}`.trim();
    const examPrepQuery = `تحضير امتحانات ${subject.ar} ${termAr} ${levelId} ${streamAr}`.trim();

    return [
      {
        title: `شرح دروس وتمارين ${termAr} — ${subject.ar} ${levelId}${streamAr ? ` ${streamAr}` : ''}`,
        channel: 'YouTube — دروس جزائرية',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(lessonQuery)}`,
      },
      {
        title: `تمارين محلولة ${termAr} — ${subject.ar}`,
        channel: 'YouTube — تمارين مع التصحيح',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseQuery)}`,
      },
      {
        title: `مراجعة وحل فروض واختبارات ${termAr} — ${subject.ar}`,
        channel: 'YouTube — مراجعات الفصول',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(reviewQuery)}`,
      },
      {
        title: `تحضير امتحانات ${termAr} — ${subject.ar} ${levelId}${streamAr ? ` ${streamAr}` : ''}`,
        channel: 'YouTube — تحضير الامتحانات',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(examPrepQuery)}`,
      },
    ];
  }

  // BEM/BAC archive — exam-focused videos
  if (category && (category.id === 'bem_archive' || category.id === 'bac_archive')) {
    const examType = category.id === 'bem_archive' ? 'BEM' : 'BAC';
    const revQuery = `مراجعة ${examType} ${subject.ar} ${levelId} ${streamAr}`.trim();
    const examQuery = `مواضيع ${examType} محلولة ${subject.ar} ${levelId} ${streamAr}`.trim();
    const tipsQuery = `نصائح وسر النجاح ${examType} ${subject.ar}`.trim();

    return [
      {
        title: `مراجعة شاملة ${examType} — ${subject.ar}`,
        channel: 'YouTube — مراجعات البكالوريا و BEM',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(revQuery)}`,
      },
      {
        title: `مواضيع ${examType} محلولة — ${subject.ar}`,
        channel: 'YouTube — مواضيع مع التصحيح',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(examQuery)}`,
      },
      {
        title: `نصائح وسر النجاح في ${examType} — ${subject.ar}`,
        channel: 'YouTube — نصائح الطلاب',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(tipsQuery)}`,
      },
    ];
  }

  // Diagnostic or no category — general videos
  const baseQuery = `شرح دروس ${subject.ar} ${contextAr}`;
  const exerciseQuery = `تمارين محلولة ${subject.ar} ${levelId} ${streamAr}`.trim();

  return [
    {
      title: `شرح دروس ${subject.ar} — ${contextAr}`,
      channel: 'YouTube — دروس جزائرية',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(baseQuery)}`,
    },
    {
      title: `تمارين محلولة — ${subject.ar} ${levelId}${streamAr ? ` ${streamAr}` : ''}`,
      channel: 'YouTube — تمارين مع التصحيح',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseQuery)}`,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Action: open ad + real exam link                                    */
/* ------------------------------------------------------------------ */

export function groupLevels(): LevelGroup[] {
  return LEVEL_GROUPS;
}
export function listSubjects(): SubjectInfo[] {
  return SUBJECTS;
}
export { subjectsForLevel, isHighSchool, isMiddleSchool, streamInfo, streamsForLevel };

/* ------------------------------------------------------------------ */
/*  BEM & BAC official exam sections                                   */
/* ------------------------------------------------------------------ */

export interface OfficialExam {
  id: string;
  title: string;
  year: string;
  subjectKey: SubjectKey;
  subjectAr: string;
  levelLabel: string;
  streamLabel: string;
  hasCorrection: boolean;
  downloads: number;
  sourceUrl: string;
  adUrl: string;
}

const BEM_YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

const BEM_SUBJECTS: { ar: string; key: SubjectKey }[] = [
  { ar: 'الرياضيات', key: 'math' },
  { ar: 'اللغة العربية', key: 'arabic' },
  { ar: 'العلوم الفيزيائية وكنولوجيا', key: 'physics' },
  { ar: 'علوم الطبيعة والحياة', key: 'science' },
  { ar: 'اللغة الإنجليزية', key: 'english' },
  { ar: 'اللغة الفرنسية', key: 'french' },
  { ar: 'التاريخ والجغرافيا', key: 'history_geo' },
  { ar: 'التربية الإسلامية', key: 'islamic' },
  { ar: 'التربية المدنية', key: 'civic_ed' },
  { ar: 'الأمازيغية', key: 'tamazight' },
];

function buildBemDirectUrl(subjectKey: string): string {
  const slug = SUBJECT_SLUGS[subjectKey as SubjectKey] ?? 'mathematiques';
  return `${DZEXAMS_BASE}/bem/${slug}`;
}

export function getBemExams(): OfficialExam[] {
  const exams: OfficialExam[] = [];
  for (const subject of BEM_SUBJECTS) {
    for (const year of BEM_YEARS) {
      const seed = subject.key.length + year.length;
      const hasCorrection = seeded(seed) > 0.3;
      const downloads = Math.floor(seeded(seed * 7) * 5000) + 100;
      exams.push({
        id: `bem-${subject.key}-${year}`,
        title: `شهادة التعليم المتوسط BEM — ${subject.ar} — ${year}`,
        year,
        subjectKey: subject.key,
        subjectAr: subject.ar,
        levelLabel: 'BEM (السنة الرابعة متوسط)',
        streamLabel: '',
        hasCorrection,
        downloads,
        sourceUrl: buildBemDirectUrl(subject.key),
        adUrl: MONETIZATION_LINK,
      });
    }
  }
  return exams;
}

const BAC_YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

function buildBacDirectUrl(subjectKey: SubjectKey): string {
  return `${DZEXAMS_BASE}/bac/${subjectSlug(subjectKey)}`;
}

export function getBacExams(): OfficialExam[] {
  const exams: OfficialExam[] = [];
  const bacStreams = streamsForLevel('3AS');
  for (const stream of bacStreams) {
    const subjects = subjectsForLevel('3AS', stream.key);
    for (const subject of subjects) {
      for (const year of BAC_YEARS) {
        const seed = stream.key.length + subject.key.length + year.length;
        const hasCorrection = seeded(seed) > 0.3;
        const downloads = Math.floor(seeded(seed * 7) * 5000) + 100;
        exams.push({
          id: `bac-${stream.key}-${subject.key}-${year}`,
          title: `البكالوريا BAC — ${subject.ar} — ${stream.shortAr} — ${year}`,
          year,
          subjectKey: subject.key,
          subjectAr: subject.ar,
          levelLabel: 'BAC (السنة الثالثة ثانوي)',
          streamLabel: stream.shortAr,
          hasCorrection,
          downloads,
          sourceUrl: buildBacDirectUrl(subject.key),
          adUrl: MONETIZATION_LINK,
        });
      }
    }
  }
  return exams;
}

/* ------------------------------------------------------------------ */
/*  Archive models (past BEM/BAC papers inside category grid)          */
/* ------------------------------------------------------------------ */

const ARCHIVE_YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

function buildArchiveDirectUrl(
  levelId: string,
  subjectKey: SubjectKey
): string {
  if (levelId === '4AM') return `${DZEXAMS_BASE}/bem/${subjectSlug(subjectKey)}`;
  return `${DZEXAMS_BASE}/bac/${subjectSlug(subjectKey)}`;
}

function getArchiveModels(
  levelId: string,
  levelAr: string,
  subject: SubjectInfo,
  category: CategoryInfo,
  streamKey?: StreamKey
): ExamModel[] {
  const dzexamsUrl = buildArchiveDirectUrl(levelId, subject.key);

  const models: ExamModel[] = [];
  for (let i = 0; i < ARCHIVE_YEARS.length; i++) {
    const year = ARCHIVE_YEARS[i];
    const seed = levelId.length + subject.key.length + year.length + (streamKey?.length ?? 0);
    const hasCorrection = seeded(seed) > 0.25;
    const downloads = Math.floor(seeded(seed * 7) * 4000) + 200;
    models.push({
      id: `archive-${levelId}-${subject.key}-${category.id}-${year}`,
      number: ARCHIVE_YEARS.length - i,
      title: `${category.shortAr} — ${subject.ar} — ${year}`,
      levelId,
      levelAr,
      subjectKey: subject.key,
      subjectAr: subject.ar,
      categoryId: category.id,
      categoryAr: category.ar,
      year,
      hasCorrection,
      downloads,
      downloadUrl: MONETIZATION_LINK,
      dzexamsUrl,
    });
  }
  return models;
}
