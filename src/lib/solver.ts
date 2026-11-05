import { SUBJECTS, type SubjectKey } from './constants';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface VariationTable {
  x: string[];
  f: string[];
}

export interface SolverStep {
  title: string;
  text?: string;
  math?: string;
  bullets?: string[];
  table?: VariationTable;
}

export interface SolverSolution {
  subjectKey: SubjectKey;
  subjectAr: string;
  topic: string;
  summary: string;
  steps: SolverStep[];
}

export interface SmartSummary {
  bullets: string[];
  finalAnswer: string;
}

/* ------------------------------------------------------------------ */
/*  Subject detection                                                  */
/* ------------------------------------------------------------------ */

const SUBJECT_KEYWORDS: Record<SubjectKey, string[]> = {
  math: ['f(x)', 'f ′(x)', 'lim', 'limite', 'dérivée', 'intégrale', 'x²', 'x^2', 'x2', 'cos', 'sin', 'tan', 'log', 'ln', 'equation', 'معادلة', 'دالة', 'نهاية', 'مشتقة', 'تكامل', 'متتالية', 'متجه', 'مثلث', 'ریاضیات', 'رياضيات', 'الرياضيات'],
  physics: ['physique', 'circuit', 'tension', 'courant', 'resistance', 'ohm', 'newton', 'force', 'énergie', 'travail', 'pression', 'optique', 'ondes', 'فيزياء', 'الفيزياء', 'تيار', 'توتر', 'مقاومة', 'دائرة', 'قوة', 'طاقة', 'ضغط'],
  science: ['svt', 'biologie', 'cellule', 'adn', 'génétique', 'écosystème', 'photosynthèse', 'respiration', 'digestion', 'enzyme', 'hypothèse', 'expérience', 'document', 'خلية', 'وراثة', 'بيئة', 'تنفس', 'تبادل', 'علوم', 'العلوم الطبيعية', 'حياة', 'وثيقة', 'إنزيم', 'فرضية', 'تجربة', 'استغلال الوثيقة', 'البروتين', 'الجين', 'النواة', 'الغشاء'],
  arabic: ['بلاغة', 'إعراب', 'نحو', 'صرف', 'نص', 'قصيدة', 'شعر', 'أدب', 'لغة عربية', 'اللغة العربية', 'إعراب', 'تحليل نص'],
  french: ['conjugaison', 'grammaire', 'vocabulaire', ' texte ', 'rédaction', 'compréhension', 'français', 'french'],
  english: ['grammar', 'tense', 'verb', 'noun', 'adjective', 'sentence', 'comprehension', 'english'],
  history_geo: ['histoire', 'géographie', 'تاريخ', 'جغرافيا', 'حرب', 'استعمار', 'ثورة', 'دولة', 'خريطة', 'مناخ'],
  islamic: ['إسلام', 'قرآن', 'حديث', 'فقه', 'عقيدة', 'تربية إسلامية', 'العلوم الإسلامية'],
  philosophy: ['philosophie', 'فلسفة', 'الوجود', 'المعرفة', 'القيم', 'العقل'],
  accounting: ['محاسبة', 'balance', 'compte', 'bilan', 'amortissement', 'تسيير', 'ميزانية'],
  economics: ['اقتصاد', 'économie', 'م рынка', 'عرض', 'طلب', 'نمو', 'مانجمنت', 'تسيير'],
  law: ['قانون', 'droit', 'عدالة', 'محكمة', 'دستور', 'مدني', 'جنائي'],
  mech_eng: ['ميكانيك', 'mécanique', 'engrenage', 'ressort', 'كام', 'تروس'],
  elec_eng: ['كهربائي', 'électrique', 'moteur', 'alternateur', 'transformateur', 'محرك'],
  civil_eng: ['مدني', 'béton', 'constructi', 'bâtiment', 'هيكل', 'بناء'],
  process_eng: ['طرائق', 'procédé', 'distillation', 'extraction', 'تقطير', 'استخلاص'],
  italian: ['italiano', 'italien', 'إيطالي'],
  spanish: ['español', 'espagnol', 'إسباني'],
  german: ['deutsch', 'allemand', 'ألماني'],
  civic_ed: ['مدنية', 'citoyenneté', 'مواطن', 'حقوق', 'واجبات'],
  tamazight: ['أمازيغية', 'amazigh', 'tifinagh'],
  art_music: ['موسيقى', 'تشكيلية', 'رسم', 'musique', 'art'],
  pe: ['بدنية', 'رياضية', 'sport', 'éducation physique'],
  informatics: ['معلوماتية', 'informatique', 'algorithme', 'programme', 'python', 'java', 'html'],
};

export function detectSubject(input: string): SubjectKey {
  const lower = input.toLowerCase();
  let best: SubjectKey | null = null;
  let bestScore = 0;
  for (const key of Object.keys(SUBJECT_KEYWORDS) as SubjectKey[]) {
    let score = 0;
    for (const kw of SUBJECT_KEYWORDS[key]) {
      if (lower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best ?? 'science';
}

function subjectAr(key: SubjectKey): string {
  return SUBJECTS.find((s) => s.key === key)?.ar ?? 'مادة عامة';
}

/* ------------------------------------------------------------------ */
/*  Math expression parsing (quadratic / polynomial)                   */
/* ------------------------------------------------------------------ */

interface ParsedQuadratic {
  a: number;
  b: number;
  c: number;
}

/** Attempt to parse ax²+bx+c from text like "f(x) = 2x^2 - 4x + 3" */
function parseQuadratic(input: string): ParsedQuadratic | null {
  const match = input.match(/=?\s*([+-]?\d*\.?\d*)\s*\*?\s*x[\^]?2\s*([+-]?\s*\d*\.?\d*)\s*\*?\s*x\s*([+-]?\s*\d*\.?\d*)/);
  if (!match) return null;
  const a = parseFloat(match[1] || '1') || 1;
  const b = parseFloat((match[2] || '').replace(/\s/g, '')) || 0;
  const c = parseFloat((match[3] || '').replace(/\s/g, '')) || 0;
  return { a, b, c };
}

/* ------------------------------------------------------------------ */
/*  Solvers                                                            */
/* ------------------------------------------------------------------ */

function solveQuadratic(
  text: string,
  parsed: ParsedQuadratic
): SolverSolution {
  const { a, b, c } = parsed;
  const delta = b * b - 4 * a * c;
  const topic = 'دراسة الدالة العددية';
  const summary = `ندرس الدالة التربيعية f(x) = ${a}x² ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)}. نحسب المميز Δ = b² − 4ac ثم نستنتج جذور الدالة ونمثلها بيانياً.`;

  const steps: SolverStep[] = [];

  // Step 1: Identify coefficients
  steps.push({
    title: 'الخطوة 1: تحديد المعاملات',
    text: `من المعطيات نستخرج معاملات الدالة التربيعية ax² + bx + c:`,
    math: `a = ${a}, \\quad b = ${b}, \\quad c = ${c}`,
    bullets: [
      `a = ${a} (معامل x²)`,
      `b = ${b} (معامل x)`,
      `c = ${c} (الحد الثابت)`,
    ],
  });

  // Step 2: Calculate discriminant
  steps.push({
    title: 'الخطوة 2: حساب المميز Δ (Discriminant)',
    text: 'المميز هو العبارة التي تحدد عدد وطبيعة جذور المعادلة.',
    math: `\\Delta = b^2 - 4ac = (${b})^2 - 4 \\times ${a} \\times ${c} = ${delta}`,
  });

  // Step 3: Roots based on delta
  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const x1 = (-b - sqrtDelta) / (2 * a);
    const x2 = (-b + sqrtDelta) / (2 * a);
    steps.push({
      title: 'الخطوة 3: إيجاد جذري المعادلة (Δ > 0)',
      text: 'بما أن Δ > 0، للمعادلة جذران حقيقيان مختلفان:',
      math: `x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} = \\frac{${-b} - \\sqrt{${delta}}}{${2 * a}} \\approx ${x1.toFixed(4)} \\\\[6pt] x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a} = \\frac{${-b} + \\sqrt{${delta}}}{${2 * a}} \\approx ${x2.toFixed(4)}`,
    });
  } else if (delta === 0) {
    const x0 = -b / (2 * a);
    steps.push({
      title: 'الخطوة 3: إيجاد الجذر المزدوج (Δ = 0)',
      text: 'بما أن Δ = 0، للمعادلة جذر حقيقي مزدوج:',
      math: `x_0 = \\frac{-b}{2a} = \\frac{${-b}}{${2 * a}} = ${x0.toFixed(4)}`,
    });
  } else {
    steps.push({
      title: 'الخطوة 3: لا توجد جذور حقيقية (Δ < 0)',
      text: 'بما أن Δ < 0، المعادلة ليس لها حل في مجموعة الأعداد الحقيقية ℝ. الدالة لا تقطع محور الأفاصيل.',
      math: `\\Delta = ${delta} < 0 \\implies \\text{لا يوجد حل في } \\mathbb{R}`,
    });
  }

  // Step 4: Vertex & axis of symmetry
  const xVertex = -b / (2 * a);
  const yVertex = a * xVertex * xVertex + b * xVertex + c;
  steps.push({
    title: 'الخطوة 4: رأس المنحنى ومحور التماثل',
    text: 'مبدأ التماثل هو المستقيم x = −b/(2a)، ورأس المنحنى هو النقطة التي تحقق القيمة الصغرى أو الكبرى للدالة.',
    math: `x_S = \\frac{-b}{2a} = \\frac{${-b}}{${2 * a}} = ${xVertex.toFixed(4)} \\\\[6pt] y_S = f(x_S) = ${yVertex.toFixed(4)} \\\\[6pt] \\text{محور التماثل: } x = ${xVertex.toFixed(4)}`,
  });

  // Step 5: Variation table
  const xVals: string[] = [];
  const fVals: string[] = [];
  if (a > 0) {
    xVals.push('-\\infty', xVertex.toFixed(2), '+\\infty');
    fVals.push('+\\infty', yVertex.toFixed(2), '+\\infty');
  } else {
    xVals.push('-\\infty', xVertex.toFixed(2), '+\\infty');
    fVals.push('-\\infty', yVertex.toFixed(2), '-\\infty');
  }

  steps.push({
    title: 'الخطوة 5: جدول تغيرات الدالة',
    text: `بما أن a = ${a} ${a > 0 ? '> 0' : '< 0'}، فإن المنحنى ${a > 0 ? 'محدب نحو الأعلى' : 'محدب نحو الأسفل'}.`,
    table: { x: xVals, f: fVals },
    bullets: a > 0
      ? [
          'الدالة تتناقص على (−∞, xS] ثم تتزايد على [xS, +∞)',
          `القيمة الدنيا للدالة هي y = ${yVertex.toFixed(4)}`,
        ]
      : [
          'الدالة تتزايد على (−∞, xS] ثم تتناقص على [xS, +∞)',
          `القيمة العليا للدالة هي y = ${yVertex.toFixed(4)}`,
        ],
  });

  // Step 6: Sign of f(x)
  if (delta > 0) {
    const sqrtDelta = Math.sqrt(delta);
    const x1 = (-b - sqrtDelta) / (2 * a);
    const x2 = (-b + sqrtDelta) / (2 * a);
    steps.push({
      title: 'الخطوة 6: إشارة f(x)',
      text: 'نحدد إشارة الدالة حسب قيم الجذور وقيمة a:',
      bullets: [
        a > 0
          ? `f(x) > 0 خارج المجال [${Math.min(x1, x2).toFixed(2)}, ${Math.max(x1, x2).toFixed(2)}]`
          : `f(x) > 0 داخل المجال [${Math.min(x1, x2).toFixed(2)}, ${Math.max(x1, x2).toFixed(2)}]`,
        `f(x) = 0 عند x = ${x1.toFixed(2)} و x = ${x2.toFixed(2)}`,
      ],
    });
  } else if (delta === 0) {
    steps.push({
      title: 'الخطوة 6: إشارة f(x)',
      text: 'لما كان Δ = 0، فإن f(x) تكون من إشارة a دائماً ولا تنعدم إلا عند الجذر المزدوج.',
      bullets: [
        a > 0 ? `f(x) ≥ 0 لكل x ∈ ℝ` : `f(x) ≤ 0 لكل x ∈ ℝ`,
        `f(x) = 0 عند x = ${xVertex.toFixed(2)} فقط`,
      ],
    });
  } else {
    steps.push({
      title: 'الخطوة 6: إشارة f(x)',
      text: 'لما كان Δ < 0، لا تنعدم الدالة أبداً. إشارتها ثابتة وتساوي إشارة a.',
      bullets: [
        a > 0 ? `f(x) > 0 لكل x ∈ ℝ` : `f(x) < 0 لكل x ∈ ℝ`,
        'المنحنى لا يقطع محور الأفاصيل إطلاقاً',
      ],
    });
  }

  return {
    subjectKey: 'math',
    subjectAr: subjectAr('math'),
    topic,
    summary,
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  SVT solver — Algerian official methodology                         */
/*  أ) استغلال الوثيقة → ب) الاستنتاج → ج) الفرضيات → د) الربط        */
/* ------------------------------------------------------------------ */

function solveSVT(text: string): SolverSolution {
  const ar = subjectAr('science');
  const topic = 'علوم الطبيعة والحياة';

  const steps: SolverStep[] = [
    {
      title: 'جاري توليد الحل الفعلي',
      text: 'الذكاء الاصطناعي يُحضّر الحل التطبيقي المباشر لهذا التمرين. سيعرض قريباً تحليل معطيات الوثيقة، الاستنتاج، تمحيص الفرضيات، والإجابة النهائية — مطبّقة على معطيات تمرينك بالذات.',
    },
  ];

  return {
    subjectKey: 'science',
    subjectAr: ar,
    topic,
    summary: 'الحل التفصيلي المطبّق على معطيات هذا التمرين سيظهر فور اتّصال الذكاء الاصطناعي. أعد المحاولة بعد لحظات.',
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Math solver — structured steps (non-quadratic)                     */
/*  فهم المعطيات → استرجاع القوانين → البرهان → النتيجة               */
/* ------------------------------------------------------------------ */

function solveMathStructured(text: string): SolverSolution {
  const ar = subjectAr('math');
  const topic = 'الرياضيات';

  const steps: SolverStep[] = [
    {
      title: 'جاري توليد الحل الفعلي',
      text: 'الذكاء الاصطناعي يُحضّر الحل التطبيقي المباشر لهذا التمرين. سيعرض قريباً المعطيات، القوانين المستخدمة، الحسابات خطوة بخطوة، والنتيجة النهائية — مطبّقة على معطيات تمرينك بالذات.',
    },
  ];

  return {
    subjectKey: 'math',
    subjectAr: ar,
    topic,
    summary: 'الحل التفصيلي المطبّق على معطيات هذا التمرين سيظهر فور اتّصال الذكاء الاصطناعي. أعد المحاولة بعد لحظات.',
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Generic solver (non-math, non-SVT subjects)                        */
/* ------------------------------------------------------------------ */

function solveGeneric(
  text: string,
  key: SubjectKey
): SolverSolution {
  const ar = subjectAr(key);
  const topic = ar;

  const steps: SolverStep[] = [
    {
      title: 'جاري توليد الحل الفعلي',
      text: 'الذكاء الاصطناعي يُحضّر الحل التطبيقي المباشر لهذا التمرين. سيعرض قريباً إجابة فعليّة مفصّلة مطبّقة على معطيات تمرينك بالذات.',
    },
  ];

  return {
    subjectKey: key,
    subjectAr: ar,
    topic,
    summary: 'الحل التفصيلي المطبّق على معطيات هذا التمرين سيظهر فور اتّصال الذكاء الاصطناعي. أعد المحاولة بعد لحظات.',
    steps,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function solveHomework(
  input: string,
  forcedSubject?: SubjectKey
): SolverSolution {
  const key = forcedSubject ?? detectSubject(input);

  // SVT — Algerian official methodology (أ→ب→ج→د)
  if (key === 'science') {
    return solveSVT(input);
  }

  // Math — try quadratic first, otherwise structured methodology
  if (key === 'math') {
    const parsed = parseQuadratic(input);
    if (parsed) {
      return solveQuadratic(input, parsed);
    }
    return solveMathStructured(input);
  }

  return solveGeneric(input, key);
}

export function generateSmartSummary(solution: SolverSolution): SmartSummary {
  const bullets: string[] = [];

  // First bullet: subject + topic
  bullets.push(`المادة: ${solution.subjectAr} — الموضوع: ${solution.topic}`);

  // Extract key info from steps
  for (const step of solution.steps) {
    if (step.bullets && step.bullets.length > 0) {
      bullets.push(step.bullets[0]);
    } else if (step.math) {
      // Clean up LaTeX for plain text summary
      const cleaned = step.math
        .replace(/\\quad/g, ' ')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
        .replace(/\\times/g, '×')
        .replace(/\\Delta/g, 'Δ')
        .replace(/\\infty/g, '∞')
        .replace(/\\mathbb\{R\}/g, 'ℝ')
        .replace(/\\approx/g, '≈')
        .replace(/\\geq/g, '≥')
        .replace(/\\leq/g, '≤')
        .replace(/\\implies/g, '⟹')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\\\/g, '; ')
        .replace(/[{}]/g, '');
      bullets.push(`${step.title}: ${cleaned.trim()}`);
    } else if (step.text) {
      bullets.push(step.text);
    }
    if (bullets.length >= 5) break;
  }

  // Final answer
  const lastStep = solution.steps[solution.steps.length - 1];
  let finalAnswer = solution.summary;
  if (lastStep?.bullets) {
    finalAnswer = lastStep.bullets.join(' · ');
  } else if (lastStep?.math) {
    const cleaned = lastStep.math
      .replace(/\\quad/g, ' ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\times/g, '×')
      .replace(/\\Delta/g, 'Δ')
      .replace(/[{}]/g, '')
      .replace(/\\\\/g, '; ');
    finalAnswer = `${lastStep.title}: ${cleaned.trim()}`;
  }

  return { bullets, finalAnswer };
}
