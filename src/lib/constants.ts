export const MONETIZATION_LINK =
  'https://asiafilm.org/4/2ef62376f95f1a0935e62ce03d5e2f6d';

export const VIP = {
  rip: '00799999000123456789',
  price: 500,
  currency: 'دج',
};

export type SubjectKey =
  | 'math'
  | 'physics'
  | 'science'
  | 'arabic'
  | 'french'
  | 'english'
  | 'history_geo'
  | 'islamic'
  | 'philosophy'
  | 'accounting'
  | 'economics'
  | 'law'
  | 'mech_eng'
  | 'elec_eng'
  | 'civil_eng'
  | 'process_eng'
  | 'italian'
  | 'spanish'
  | 'german'
  | 'civic_ed'
  | 'tamazight'
  | 'art_music'
  | 'pe'
  | 'informatics';

export interface SubjectInfo {
  key: SubjectKey;
  ar: string;
  coefficient: number;
}

/** High school subject catalog (used with stream filtering) */
export const SUBJECTS: SubjectInfo[] = [
  { key: 'math', ar: 'الرياضيات', coefficient: 4 },
  { key: 'physics', ar: 'الفيزياء', coefficient: 3 },
  { key: 'science', ar: 'العلوم الطبيعية', coefficient: 2 },
  { key: 'arabic', ar: 'اللغة العربية', coefficient: 3 },
  { key: 'french', ar: 'اللغة الفرنسية', coefficient: 2 },
  { key: 'english', ar: 'اللغة الإنجليزية', coefficient: 2 },
  { key: 'history_geo', ar: 'التاريخ والجغرافيا', coefficient: 2 },
  { key: 'islamic', ar: 'العلوم الإسلامية', coefficient: 2 },
  { key: 'philosophy', ar: 'الفلسفة', coefficient: 2 },
  { key: 'accounting', ar: 'المحاسبة والتسيير المالي', coefficient: 3 },
  { key: 'economics', ar: 'الاقتصاد والمانجمنت', coefficient: 2 },
  { key: 'law', ar: 'القانون', coefficient: 1 },
  { key: 'mech_eng', ar: 'الهندسة الميكانيكية', coefficient: 3 },
  { key: 'elec_eng', ar: 'الهندسة الكهربائية', coefficient: 3 },
  { key: 'civil_eng', ar: 'الهندسة المدنية', coefficient: 3 },
  { key: 'process_eng', ar: 'هندسة الطرائق', coefficient: 3 },
  { key: 'italian', ar: 'اللغة الإيطالية', coefficient: 2 },
  { key: 'spanish', ar: 'اللغة الإسبانية', coefficient: 2 },
  { key: 'german', ar: 'اللغة الألمانية', coefficient: 2 },
];

/** Middle school subject catalog — official Algerian curriculum only */
const MIDDLE_SCHOOL_SUBJECTS: SubjectInfo[] = [
  { key: 'math', ar: 'الرياضيات', coefficient: 4 },
  { key: 'arabic', ar: 'اللغة العربية', coefficient: 3 },
  { key: 'physics', ar: 'العلوم الفيزيائية وكنولوجيا', coefficient: 3 },
  { key: 'science', ar: 'علوم الطبيعة والحياة', coefficient: 2 },
  { key: 'french', ar: 'اللغة الفرنسية', coefficient: 2 },
  { key: 'english', ar: 'اللغة الإنجليزية', coefficient: 2 },
  { key: 'history_geo', ar: 'التاريخ والجغرافيا', coefficient: 2 },
  { key: 'islamic', ar: 'التربية الإسلامية', coefficient: 2 },
  { key: 'civic_ed', ar: 'التربية المدنية', coefficient: 1 },
  { key: 'tamazight', ar: 'الأمازيغية', coefficient: 1 },
];

const MIDDLE_SCHOOL_LEVELS = new Set(['1AM', '2AM', '3AM', '4AM']);

export function isMiddleSchool(levelId: string): boolean {
  return MIDDLE_SCHOOL_LEVELS.has(levelId);
}

/* ------------------------------------------------------------------ */
/*  Streams (High School only)                                         */
/* ------------------------------------------------------------------ */

export type StreamKey =
  | 'common_science'
  | 'common_arts'
  | 'sciences'
  | 'math'
  | 'tech_math'
  | 'management'
  | 'letters'
  | 'languages';

export interface StreamInfo {
  key: StreamKey;
  ar: string;
  shortAr: string;
}

/** Streams shown for 1AS (common trunks only) */
const STREAMS_1AS: StreamInfo[] = [
  { key: 'common_science', ar: 'جذع مشترك علوم وتكنولوجيا', shortAr: 'جذع علوم وتكنولوجيا' },
  { key: 'common_arts', ar: 'جذع مشترك آداب', shortAr: 'جذع آداب' },
];

/** Streams shown for 2AS & 3AS (specialized branches) */
const STREAMS_BAC: StreamInfo[] = [
  { key: 'sciences', ar: 'شعبة العلوم التجريبية', shortAr: 'علوم تجريبية' },
  { key: 'math', ar: 'شعبة الرياضيات', shortAr: 'رياضيات' },
  { key: 'tech_math', ar: 'شعبة التقني رياضي', shortAr: 'تقني رياضي' },
  { key: 'management', ar: 'شعبة تسيير واقتصاد', shortAr: 'تسيير واقتصاد' },
  { key: 'letters', ar: 'شعبة آداب وفلسفة', shortAr: 'آداب وفلسفة' },
  { key: 'languages', ar: 'شعبة اللغات الأجنبية', shortAr: 'لغات أجنبية' },
];

export const ALL_STREAMS: StreamInfo[] = [...STREAMS_1AS, ...STREAMS_BAC];

export function streamsForLevel(levelId: string): StreamInfo[] {
  if (levelId === '1AS') return STREAMS_1AS;
  if (levelId === '2AS' || levelId === '3AS') return STREAMS_BAC;
  return [];
}

export function streamInfo(key: StreamKey): StreamInfo | undefined {
  return ALL_STREAMS.find((s) => s.key === key);
}

const HIGH_SCHOOL_LEVELS = new Set(['1AS', '2AS', '3AS']);

export function isHighSchool(levelId: string): boolean {
  return HIGH_SCHOOL_LEVELS.has(levelId);
}

/* ------------------------------------------------------------------ */
/*  Subject mapping per stream                                         */
/* ------------------------------------------------------------------ */

const COMMON_SCIENCE_SUBJECTS = new Set<SubjectKey>([
  'math', 'physics', 'science', 'arabic', 'french', 'english',
  'history_geo', 'islamic',
]);

const COMMON_ARTS_SUBJECTS = new Set<SubjectKey>([
  'arabic', 'french', 'english', 'history_geo', 'islamic',
  'math', 'science',
]);

const STREAM_SUBJECTS: Record<StreamKey, Set<SubjectKey>> = {
  common_science: COMMON_SCIENCE_SUBJECTS,
  common_arts: COMMON_ARTS_SUBJECTS,
  sciences: new Set<SubjectKey>([
    'math', 'physics', 'science', 'arabic', 'french', 'english',
    'history_geo', 'islamic', 'philosophy',
  ]),
  math: new Set<SubjectKey>([
    'math', 'physics', 'science', 'arabic', 'french', 'english',
    'history_geo', 'islamic', 'philosophy',
  ]),
  tech_math: new Set<SubjectKey>([
    'math', 'physics', 'science', 'arabic', 'french', 'english',
    'history_geo', 'islamic',
    'mech_eng', 'elec_eng', 'civil_eng', 'process_eng',
  ]),
  management: new Set<SubjectKey>([
    'math', 'arabic', 'french', 'english',
    'history_geo', 'islamic', 'philosophy',
    'accounting', 'economics', 'law',
  ]),
  letters: new Set<SubjectKey>([
    'arabic', 'french', 'english', 'history_geo', 'islamic', 'philosophy',
  ]),
  languages: new Set<SubjectKey>([
    'arabic', 'french', 'english', 'history_geo', 'islamic', 'philosophy',
    'italian', 'spanish', 'german',
  ]),
};

const PHILOSOPHY_LEVELS = new Set(['2AS', '3AS']);

export function subjectsForLevel(levelId: string, streamKey?: StreamKey): SubjectInfo[] {
  if (!levelId) return SUBJECTS;

  // Middle school: fixed official subject list, no streams, no HS modules
  if (isMiddleSchool(levelId)) {
    return MIDDLE_SCHOOL_SUBJECTS;
  }

  // High school: filter by stream if provided
  let pool = SUBJECTS;
  if (streamKey && isHighSchool(levelId)) {
    const allowed = STREAM_SUBJECTS[streamKey];
    if (allowed) {
      pool = SUBJECTS.filter((s) => allowed.has(s.key));
    }
  }

  if (!PHILOSOPHY_LEVELS.has(levelId)) {
    pool = pool.filter((s) => s.key !== 'philosophy');
  }
  return pool;
}

export function isSubjectValidForLevel(levelId: string, subjectKey: string): boolean {
  if (!subjectKey) return true;
  if (subjectKey !== 'philosophy') return true;
  return PHILOSOPHY_LEVELS.has(levelId);
}

/* ------------------------------------------------------------------ */
/*  Exact official coefficients for Grade Calculator                    */
/*  Key: `${levelId}:${streamKey}` or just `${levelId}` for middle      */
/* ------------------------------------------------------------------ */

type CoefEntry = { key: SubjectKey; coef: number };

/** All subject Arabic labels keyed by SubjectKey for quick lookup */
const SUBJECT_LABELS: Record<SubjectKey, string> = {
  math: 'الرياضيات',
  physics: 'العلوم الفيزيائية والتكنولوجية',
  science: 'علوم الطبيعة والحياة',
  arabic: 'اللغة العربية',
  french: 'اللغة الفرنسية',
  english: 'اللغة الإنجليزية',
  history_geo: 'التاريخ والجغرافيا',
  islamic: 'التربية الإسلامية',
  philosophy: 'الفلسفة',
  accounting: 'المحاسبة والتسيير المالي',
  economics: 'الاقتصاد والمانجمنت',
  law: 'القانون',
  mech_eng: 'الهندسة الميكانيكية',
  elec_eng: 'الهندسة الكهربائية',
  civil_eng: 'الهندسة المدنية',
  process_eng: 'هندسة الطرائق',
  italian: 'اللغة الإيطالية',
  spanish: 'اللغة الإسبانية',
  german: 'اللغة الألمانية',
  civic_ed: 'التربية المدنية',
  tamazight: 'اللغة الأمازيغية',
  art_music: 'التربية الموسيقية والتشكيلية',
  pe: 'التربية البدنية والرياضية',
  informatics: 'المعلوماتية',
};

/**
 * Middle school — exact official coefficients per the Ministry table.
 * Coefficients vary by year for most subjects.
 * التربية الموسيقية/التشكيلية, البدنية, المعلوماتية = coeff 1 all years.
 */
const MIDDLE_COEFFS: Record<string, CoefEntry[]> = {
  '1AM': [
    { key: 'arabic', coef: 2 },
    { key: 'tamazight', coef: 2 },
    { key: 'french', coef: 1 },
    { key: 'english', coef: 1 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 1 },
    { key: 'physics', coef: 1 },
    { key: 'islamic', coef: 1 },
    { key: 'history_geo', coef: 2 },
    { key: 'civic_ed', coef: 1 },
    { key: 'art_music', coef: 1 },
    { key: 'pe', coef: 1 },
    { key: 'informatics', coef: 1 },
  ],
  '2AM': [
    { key: 'arabic', coef: 3 },
    { key: 'tamazight', coef: 2 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 1 },
    { key: 'math', coef: 3 },
    { key: 'science', coef: 2 },
    { key: 'physics', coef: 2 },
    { key: 'islamic', coef: 1 },
    { key: 'history_geo', coef: 2 },
    { key: 'civic_ed', coef: 1 },
    { key: 'art_music', coef: 1 },
    { key: 'pe', coef: 1 },
    { key: 'informatics', coef: 1 },
  ],
  '3AM': [
    { key: 'arabic', coef: 3 },
    { key: 'tamazight', coef: 2 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 1 },
    { key: 'math', coef: 3 },
    { key: 'science', coef: 2 },
    { key: 'physics', coef: 2 },
    { key: 'islamic', coef: 1 },
    { key: 'history_geo', coef: 2 },
    { key: 'civic_ed', coef: 1 },
    { key: 'art_music', coef: 1 },
    { key: 'pe', coef: 1 },
    { key: 'informatics', coef: 1 },
  ],
  '4AM': [
    { key: 'arabic', coef: 5 },
    { key: 'tamazight', coef: 2 },
    { key: 'french', coef: 3 },
    { key: 'english', coef: 2 },
    { key: 'math', coef: 4 },
    { key: 'science', coef: 2 },
    { key: 'physics', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'history_geo', coef: 3 },
    { key: 'civic_ed', coef: 1 },
    { key: 'art_music', coef: 1 },
    { key: 'pe', coef: 1 },
    { key: 'informatics', coef: 1 },
  ],
};

/** High school — exact official coefficients per stream and level */
const HS_COEFFS: Record<string, CoefEntry[]> = {
  // 1AS — جذع مشترك علوم وتكنولوجيا
  '1AS:common_science': [
    { key: 'math', coef: 4 },
    { key: 'physics', coef: 3 },
    { key: 'science', coef: 2 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 3 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'tamazight', coef: 1 },
  ],
  // 1AS — جذع مشترك آداب
  '1AS:common_arts': [
    { key: 'arabic', coef: 5 },
    { key: 'french', coef: 3 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 3 },
    { key: 'islamic', coef: 2 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 2 },
    { key: 'tamazight', coef: 1 },
  ],

  // 2AS — العلوم التجريبية
  '2AS:sciences': [
    { key: 'science', coef: 5 },
    { key: 'math', coef: 4 },
    { key: 'physics', coef: 4 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
  ],
  // 2AS — الرياضيات
  '2AS:math': [
    { key: 'math', coef: 6 },
    { key: 'physics', coef: 4 },
    { key: 'science', coef: 3 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
  ],
  // 2AS — تقني رياضي
  '2AS:tech_math': [
    { key: 'math', coef: 5 },
    { key: 'physics', coef: 4 },
    { key: 'science', coef: 3 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
    { key: 'mech_eng', coef: 3 },
    { key: 'elec_eng', coef: 3 },
    { key: 'civil_eng', coef: 3 },
    { key: 'process_eng', coef: 3 },
  ],
  // 2AS — تسيير واقتصاد
  '2AS:management': [
    { key: 'math', coef: 4 },
    { key: 'accounting', coef: 5 },
    { key: 'economics', coef: 4 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 3 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
    { key: 'law', coef: 1 },
  ],
  // 2AS — آداب وفلسفة
  '2AS:letters': [
    { key: 'arabic', coef: 5 },
    { key: 'philosophy', coef: 3 },
    { key: 'french', coef: 3 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 3 },
    { key: 'islamic', coef: 2 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 2 },
  ],
  // 2AS — لغات أجنبية
  '2AS:languages': [
    { key: 'arabic', coef: 4 },
    { key: 'french', coef: 5 },
    { key: 'english', coef: 5 },
    { key: 'philosophy', coef: 3 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 2 },
    { key: 'italian', coef: 3 },
    { key: 'spanish', coef: 3 },
    { key: 'german', coef: 3 },
  ],

  // 3AS — العلوم التجريبية
  '3AS:sciences': [
    { key: 'science', coef: 6 },
    { key: 'math', coef: 5 },
    { key: 'physics', coef: 5 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
  ],
  // 3AS — الرياضيات
  '3AS:math': [
    { key: 'math', coef: 7 },
    { key: 'physics', coef: 5 },
    { key: 'science', coef: 3 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
  ],
  // 3AS — تقني رياضي
  '3AS:tech_math': [
    { key: 'math', coef: 6 },
    { key: 'physics', coef: 5 },
    { key: 'science', coef: 3 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
    { key: 'mech_eng', coef: 4 },
    { key: 'elec_eng', coef: 4 },
    { key: 'civil_eng', coef: 4 },
    { key: 'process_eng', coef: 4 },
  ],
  // 3AS — تسيير واقتصاد
  '3AS:management': [
    { key: 'math', coef: 5 },
    { key: 'accounting', coef: 6 },
    { key: 'economics', coef: 5 },
    { key: 'history_geo', coef: 4 },
    { key: 'arabic', coef: 3 },
    { key: 'french', coef: 2 },
    { key: 'english', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'philosophy', coef: 2 },
    { key: 'law', coef: 1 },
  ],
  // 3AS — آداب وفلسفة
  '3AS:letters': [
    { key: 'philosophy', coef: 5 },
    { key: 'arabic', coef: 5 },
    { key: 'french', coef: 3 },
    { key: 'english', coef: 2 },
    { key: 'history_geo', coef: 3 },
    { key: 'islamic', coef: 2 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 2 },
  ],
  // 3AS — لغات أجنبية
  '3AS:languages': [
    { key: 'french', coef: 5 },
    { key: 'english', coef: 5 },
    { key: 'arabic', coef: 4 },
    { key: 'philosophy', coef: 4 },
    { key: 'history_geo', coef: 2 },
    { key: 'islamic', coef: 2 },
    { key: 'math', coef: 2 },
    { key: 'science', coef: 2 },
    { key: 'italian', coef: 4 },
    { key: 'spanish', coef: 4 },
    { key: 'german', coef: 4 },
  ],
};

/**
 * Returns exact official subjects with correct coefficients for the
 * Grade Calculator, keyed by level and stream.
 * This is independent from subjectsForLevel (used by ExamVault) which
 * uses a simpler shared catalog.
 */
export function gradeCalcSubjects(
  levelId: string,
  streamKey?: StreamKey
): SubjectInfo[] {
  // Middle school
  if (isMiddleSchool(levelId)) {
    const entries = MIDDLE_COEFFS[levelId];
    if (entries) {
      return entries.map((e) => ({
        key: e.key,
        ar: SUBJECT_LABELS[e.key],
        coefficient: e.coef,
      }));
    }
  }

  // High school
  if (isHighSchool(levelId) && streamKey) {
    const key = `${levelId}:${streamKey}`;
    const entries = HS_COEFFS[key];
    if (entries) {
      return entries.map((e) => ({
        key: e.key,
        ar: SUBJECT_LABELS[e.key],
        coefficient: e.coef,
      }));
    }
  }

  return [];
}

export interface LevelGroup {
  stage: string;
  levels: { id: string; ar: string }[];
}

export const LEVEL_GROUPS: LevelGroup[] = [
  {
    stage: 'التعليم المتوسط',
    levels: [
      { id: '1AM', ar: 'السنة الأولى متوسط' },
      { id: '2AM', ar: 'السنة الثانية متوسط' },
      { id: '3AM', ar: 'السنة الثالثة متوسط' },
      { id: '4AM', ar: 'السنة الرابعة متوسط (BEM)' },
    ],
  },
  {
    stage: 'التعليم الثانوي',
    levels: [
      { id: '1AS', ar: 'السنة الأولى ثانوي' },
      { id: '2AS', ar: 'السنة الثانية ثانوي' },
      { id: '3AS', ar: 'السنة الثالثة ثانوي (BAC)' },
    ],
  },
];

export const TERMS = [
  { id: 'T1', ar: 'الفصل الأول' },
  { id: 'T2', ar: 'الفصل الثاني' },
  { id: 'T3', ar: 'الفصل الثالث' },
];

export const VIP_LABELS = {
  title: 'اشترك في الباقة VIP',
  subtitle: 'افتح جميع الامتحانات وحلول الواجبات بلا حدود',
  ripLabel: 'الرقم الداخلي للحساب (RIP) - BaridiMob / CCP',
  priceLabel: 'ثمن الاشتراك',
  uploadTitle: 'إثبات الدفع (صورة الوصل)',
  uploadHint: 'قم برفع صورة وصل الدفع بعد تحويل المبلغ إلى الحساب أعلاه.',
  submit: 'إرسال طلب الاشتراك',
  pending: 'طلبك قيد المراجعة، سيتم تفعيل اشتراكك بعد التحقق من الوصل.',
  thanks: 'شكراً لك! تم استلام طلبك بنجاح.',
};
