import {
  gradeCalcSubjects,
  type SubjectKey,
  type StreamKey,
  type SubjectInfo,
} from './constants';

export interface SubjectGrade {
  key: SubjectKey;
  label: string;
  coefficient: number;
  term1: number | null; // الفصل الأول
  term2: number | null; // الفصل الثاني
  term3: number | null; // الفصل الثالث
}

export function createEmptyGrades(
  levelId: string,
  streamKey?: StreamKey
): SubjectGrade[] {
  const subjects = gradeCalcSubjects(levelId, streamKey);
  return subjects.map((s: SubjectInfo) => ({
    key: s.key,
    label: s.ar,
    coefficient: s.coefficient,
    term1: null,
    term2: null,
    term3: null,
  }));
}

/** Arithmetic average of the three terms for a single subject */
export function subjectAverage(g: SubjectGrade): number | null {
  const terms = [g.term1, g.term2, g.term3].filter(
    (v): v is number => v != null
  );
  if (terms.length === 0) return null;
  const sum = terms.reduce((a, b) => a + clamp20(b), 0);
  return sum / terms.length;
}

/**
 * Weighted overall GPA: sum(subjectAvg × coefficient) / sum(coefficients)
 * Only subjects with at least one entered term are counted.
 */
export function termGPA(grades: SubjectGrade[]): number | null {
  let totalPoints = 0;
  let totalCoef = 0;
  for (const g of grades) {
    const avg = subjectAverage(g);
    if (avg == null) continue;
    totalPoints += avg * g.coefficient;
    totalCoef += g.coefficient;
  }
  if (totalCoef === 0) return null;
  return totalPoints / totalCoef;
}

export function clamp20(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(20, v));
}

export function appreciation(avg: number): string {
  if (avg >= 16) return 'ممتاز';
  if (avg >= 14) return 'جيد جداً';
  if (avg >= 12) return 'جيد';
  if (avg >= 10) return 'مقبول';
  if (avg >= 9) return 'ضعيف';
  return 'ضعيف جداً';
}

export function gradeColor(avg: number): string {
  if (avg >= 16) return 'text-emerald-neon';
  if (avg >= 14) return 'text-emerald-bright';
  if (avg >= 12) return 'text-emerald-deep';
  if (avg >= 10) return 'text-yellow-400';
  return 'text-red-400';
}
