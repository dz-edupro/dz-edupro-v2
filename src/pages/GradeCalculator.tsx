import { useMemo, useState } from 'react';
import {
  Calculator,
  Award,
  RotateCcw,
  TrendingUp,
  GraduationCap,
  Layers,
} from 'lucide-react';
import {
  LEVEL_GROUPS,
  streamsForLevel,
  streamInfo,
  isHighSchool,
  type StreamKey,
} from '@/lib/constants';
import {
  createEmptyGrades,
  subjectAverage,
  termGPA,
  appreciation,
  gradeColor,
  type SubjectGrade,
} from '@/lib/grades';

export default function GradeCalculator() {
  const [levelId, setLevelId] = useState('');
  const [streamKey, setStreamKey] = useState<StreamKey | undefined>(undefined);
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [setupDone, setSetupDone] = useState(false);

  const gpa = useMemo(() => termGPA(grades), [grades]);
  const completed = grades.filter((g) => subjectAverage(g) != null).length;
  const totalCoef = grades.reduce((sum, g) => sum + g.coefficient, 0);

  const selectLevel = (id: string) => {
    setLevelId(id);
    setStreamKey(undefined);
    if (!isHighSchool(id)) {
      setGrades(createEmptyGrades(id));
      setSetupDone(true);
    }
  };

  const selectStream = (sk: StreamKey) => {
    setStreamKey(sk);
    setGrades(createEmptyGrades(levelId, sk));
    setSetupDone(true);
  };

  const backToSetup = () => {
    setSetupDone(false);
    setLevelId('');
    setStreamKey(undefined);
    setGrades([]);
  };

  const update = (
    key: string,
    field: 'term1' | 'term2' | 'term3',
    value: string
  ) => {
    const num = value === '' ? null : Math.max(0, Math.min(20, Number(value)));
    setGrades((prev) =>
      prev.map((g) =>
        g.key === key
          ? { ...g, [field]: Number.isNaN(num as number) ? null : num }
          : g
      )
    );
  };

  const reset = () => {
    if (levelId) setGrades(createEmptyGrades(levelId, streamKey));
  };

  const levelAr = LEVEL_GROUPS.flatMap((g) => g.levels).find(
    (l) => l.id === levelId
  )?.ar ?? '';

  /* ------------------------------------------------------------------ */
  /*  Setup screen — level + stream selection                            */
  /* ------------------------------------------------------------------ */

  if (!setupDone) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">حاسبة المعدلات الجزائرية</h2>
            <p className="text-sm text-gray-400">اختر المستوى والشعبة لحساب معدلك حسب المنهاج الرسمي</p>
          </div>
        </div>

        {/* Level selection */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Layers size={16} className="text-emerald-neon" />
            اختر المستوى الدراسي
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {LEVEL_GROUPS.flatMap((group) =>
              group.levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => selectLevel(level.id)}
                  className={`glass rounded-xl p-4 flex items-center gap-3 border transition-all group text-right ${
                    levelId === level.id
                      ? 'border-emerald-neon/60 bg-emerald-neon/10'
                      : 'border-transparent hover:border-emerald-neon/40'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-xs font-bold text-emerald-neon mb-0.5">{level.id}</span>
                    <span className="block text-sm text-white truncate">{level.ar}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Stream selection (high school only) */}
        {levelId && isHighSchool(levelId) && (
          <div>
            <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-neon" />
              اختر الشعبة — {levelAr}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {streamsForLevel(levelId).map((stream) => (
                <button
                  key={stream.key}
                  onClick={() => selectStream(stream.key)}
                  className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
                >
                  <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors shrink-0">
                    <GraduationCap size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm text-white truncate">{stream.ar}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subjects preview */}
        {levelId && (!isHighSchool(levelId) || streamKey) && (
          <div className="glass rounded-2xl p-4">
            <h4 className="text-xs font-bold text-gray-400 mb-2">المواد والمعاملات</h4>
            <div className="flex flex-wrap gap-2">
              {grades.map((g) => (
                <span
                  key={g.key}
                  className="inline-flex items-center gap-1.5 text-xs bg-white/5 px-2.5 py-1 rounded-lg text-gray-300"
                >
                  {g.label}
                  <span className="text-emerald-neon font-bold">×{g.coefficient}</span>
                </span>
              ))}
            </div>
            {isHighSchool(levelId) && !streamKey && (
              <p className="text-xs text-amber-400/70 mt-2">اختر شعبة لعرض المواد</p>
            )}
          </div>
        )}
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Grade input table                                                  */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">حاسبة المعدلات</h2>
            <p className="text-sm text-gray-400">
              {levelAr}
              {streamKey && ` · ${streamInfo(streamKey)?.shortAr}`}
            </p>
          </div>
        </div>
        <button
          onClick={backToSetup}
          className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
        >
          <Layers size={14} />
          تغيير المستوى
        </button>
      </div>

      {/* GPA summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <SummaryCard
          icon={<TrendingUp size={20} />}
          label="المعدل العام المرجح"
          value={gpa != null ? gpa.toFixed(2) : '--'}
          valueClass={gpa != null ? gradeColor(gpa) : 'text-gray-500'}
          sub={gpa != null ? appreciation(gpa) : 'أدخل الدرجات'}
        />
        <SummaryCard
          icon={<Award size={20} />}
          label="المواد المحسوبة"
          value={`${completed}/${grades.length}`}
          valueClass="text-white"
          sub={`مجموع المعاملات: ${totalCoef}`}
        />
        <div className="glass rounded-2xl p-4 flex flex-col justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 w-full bg-navy-800/60 hover:bg-navy-700/60 border border-white/10 text-gray-300 hover:text-white py-3 rounded-xl transition-colors text-sm font-semibold"
          >
            <RotateCcw size={16} />
            تصفير الكل
          </button>
        </div>
      </div>

      {/* Formula reminder */}
      <div className="glass rounded-2xl p-4 text-center">
        <p className="text-sm text-gray-300">
          معدل المادة ={' '}
          <span className="text-emerald-neon font-mono" dir="ltr">
            (T1 + T2 + T3) / عدد الفصول
          </span>
          {' · '}
          المعدل العام ={' '}
          <span className="text-emerald-neon font-mono" dir="ltr">
            Σ(معدل المادة × المعامل) / Σ المعاملات
          </span>
        </p>
      </div>

      {/* Grades table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-right p-3 font-semibold">المادة</th>
                <th className="p-3 font-semibold w-16">المعامل</th>
                <th className="p-3 font-semibold">الفصل الأول</th>
                <th className="p-3 font-semibold">الفصل الثاني</th>
                <th className="p-3 font-semibold">الفصل الثالث</th>
                <th className="p-3 font-semibold">المعدل الحسابي</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const avg = subjectAverage(g);
                return (
                  <tr
                    key={g.key}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-3 text-white font-semibold">{g.label}</td>
                    <td className="p-3 text-center text-emerald-neon font-bold">{g.coefficient}</td>
                    <CellInput
                      value={g.term1}
                      onChange={(v) => update(g.key, 'term1', v)}
                    />
                    <CellInput
                      value={g.term2}
                      onChange={(v) => update(g.key, 'term2', v)}
                    />
                    <CellInput
                      value={g.term3}
                      onChange={(v) => update(g.key, 'term3', v)}
                    />
                    <td className="p-3 text-center">
                      <span
                        className={`font-bold ${
                          avg != null ? gradeColor(avg) : 'text-gray-600'
                        }`}
                      >
                        {avg != null ? avg.toFixed(2) : '--'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {gpa != null && (
              <tfoot>
                <tr className="border-t-2 border-emerald-neon/30">
                  <td className="p-3 text-white font-bold" colSpan={4}>المعدل العام المرجح</td>
                  <td className="p-3 text-center text-gray-400 font-semibold">{totalCoef}</td>
                  <td className="p-3 text-center">
                    <span className={`text-lg font-extrabold ${gradeColor(gpa)}`}>
                      {gpa.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function CellInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: string) => void;
}) {
  return (
    <td className="p-2">
      <input
        type="number"
        min={0}
        max={20}
        step={0.25}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0-20"
        className="w-20 mx-auto block bg-navy-800/60 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white placeholder-gray-600 focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all text-sm"
      />
    </td>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  valueClass,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
  sub: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
        <span className="text-emerald-neon">{icon}</span>
        {label}
      </div>
      <p className={`text-3xl font-extrabold ${valueClass}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
