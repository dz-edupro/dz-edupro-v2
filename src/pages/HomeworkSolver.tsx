import { useRef, useState } from 'react';
import { Brain, Upload, Camera, FileText, Copy, Check, Sparkles, Loader as Loader2, Lightbulb, ListChecks, BookOpen, X, ScanLine, CircleAlert as AlertCircle, ExternalLink } from 'lucide-react';
import Katex from '@/components/Katex';
import {
  detectSubject,
  generateSmartSummary,
  type SolverSolution,
  type SolverStep,
  type SmartSummary,
} from '@/lib/solver';
import { MONETIZATION_LINK, SUBJECTS, type SubjectKey } from '@/lib/constants';
import { solveWithGroq } from '@/lib/aiSolver';

const SAMPLE = 'f(x) = 2x^2 - 4x + 3';

const AD_LINK = 'https://asiafilm.org/4/7d391a51bf85d2502d48870247e91ba3';
const AD_COOLDOWN_MS = 3 * 60 * 1000; // show ad at most once every 3 minutes

interface SubjectOption {
  key: SubjectKey | 'auto';
  ar: string;
}

const SUBJECT_OPTIONS: SubjectOption[] = [
  { key: 'auto', ar: 'كشف تلقائي للمادة' },
  ...SUBJECTS.map((s) => ({ key: s.key, ar: s.ar })),
];

export default function HomeworkSolver() {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [subjectChoice, setSubjectChoice] = useState<SubjectKey | 'auto'>('auto');
  const [solution, setSolution] = useState<SolverSolution | null>(null);
  const [summary, setSummary] = useState<SmartSummary | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adOpen, setAdOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(3);
  const photoObjectUrl = useRef<string | null>(null);
  const imageFileRef = useRef<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const lastAdShownAt = useRef<number>(0);
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setImageFromFile = (f: File, sourceLabel: string) => {
    if (photoObjectUrl.current) URL.revokeObjectURL(photoObjectUrl.current);
    const url = URL.createObjectURL(f);
    photoObjectUrl.current = url;
    setPhotoPreview(url);
    setImageData(f.name);
    imageFileRef.current = f;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result as string);
    reader.readAsDataURL(f);
    setInput((prev) =>
      prev
        ? `${prev}\n[${sourceLabel}: ${f.name}]`.trim()
        : `[${sourceLabel}: ${f.name}]`
    );
  };

  const handleCameraCapture = (f: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setImageFromFile(f, 'صورة ملتقطة');
  };

  const clearPhoto = () => {
    if (photoObjectUrl.current) {
      URL.revokeObjectURL(photoObjectUrl.current);
      photoObjectUrl.current = null;
    }
    setPhotoPreview(null);
    setImageData(null);
    setImageBase64(null);
    imageFileRef.current = null;
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    if (f.type.startsWith('image/')) {
      setImageFromFile(f, 'صورة مرفوعة');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setInput((prev) =>
        prev
          ? `${prev}\n[ملف: ${f.name}]\n${text}`.trim()
          : `[ملف: ${f.name}]\n${text}`
      );
    };
    reader.onerror = () => setInput((prev) => `${prev}\n[ملف: ${f.name}]`.trim());
    reader.readAsText(f);
  };

  const runSolve = async () => {
    if (!input.trim() && !imageBase64) return;
    setLoading(true);
    setSolution(null);
    setSummary(null);
    setShowSummary(false);
    setError(null);
    const forced = subjectChoice === 'auto' ? undefined : subjectChoice;
    const subjectAr = forced
      ? SUBJECTS.find((s) => s.key === forced)?.ar
      : undefined;

    try {
      if (imageBase64) {
        throw new Error('حل الصور غير متاح حالياً. يرجى كتابة نص التمرين.');
      }
      const text = input.trim();
      const result = await solveWithGroq(text, forced ?? detectSubject(text), subjectAr);
      setSolution(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء الاتصال بالذكاء الاصطناعي';
      setError(msg);
      setSolution(null);
    } finally {
      setLoading(false);
    }
  };

  const solve = () => {
    if (!input.trim() && !imageBase64) return;

    // Throttle: only show the ad interstitial if enough time has passed.
    const now = Date.now();
    if (now - lastAdShownAt.current < AD_COOLDOWN_MS) {
      runSolve();
      return;
    }

    lastAdShownAt.current = now;
    window.open(AD_LINK, '_blank', 'noopener,noreferrer');
    setAdCountdown(3);
    setAdOpen(true);
    runSolve();

    if (adTimerRef.current) clearInterval(adTimerRef.current);
    adTimerRef.current = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          if (adTimerRef.current) clearInterval(adTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const skipAd = () => {
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    setAdOpen(false);
  };

  const runSummary = () => {
    if (!solution) return;
    setSummarizing(true);
    setSummary(null);
    setShowSummary(true);
    setTimeout(() => {
      setSummary(generateSmartSummary(solution));
      setSummarizing(false);
    }, 600);
  };

  const copySolution = async () => {
    window.open(MONETIZATION_LINK, '_blank', 'noopener,noreferrer');
    if (solution) {
      const text = `${solution.subjectAr} — ${solution.topic}\n\n${solution.summary}\n\n${solution.steps
        .map((s) => `${s.title}\n${s.text ?? ''}\n${s.math ?? ''}`)
        .join('\n\n')}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Brain />}
        title="حل الواجبات بالذكاء الاصطناعي"
        subtitle="جميع المواد — حل خطوة بخطوة مع تلخيص ذكي"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              اختيار المادة
            </label>
            <div className="relative">
              <BookOpen
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-neon pointer-events-none"
              />
              <select
                value={subjectChoice}
                onChange={(e) =>
                  setSubjectChoice(e.target.value as SubjectKey | 'auto')
                }
                className="w-full appearance-none bg-navy-800/60 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all cursor-pointer text-sm"
              >
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} className="bg-navy-900">
                    {o.ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              نص التمرين
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب أو الصق التمرين هنا... مثال: f(x) = 2x^2 - 4x + 3"
              rows={6}
              className="w-full bg-navy-800/60 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all resize-none font-mono text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              أو ارفع ملف التمرين
            </label>
            <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-white/15 hover:border-emerald-neon/50 rounded-xl py-4 px-4 cursor-pointer transition-colors group">
              <Upload
                size={20}
                className="text-gray-400 group-hover:text-emerald-neon transition-colors"
              />
              <span className="text-sm text-gray-400 group-hover:text-emerald-neon transition-colors">
                {fileName || 'رفع ملف (صورة / نص)'}
              </span>
              <input
                type="file"
                accept="image/*,.txt,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {/* Camera capture */}
          <div>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full border-2 border-emerald-neon/30 hover:border-emerald-neon/60 bg-emerald-neon/[0.03] hover:bg-emerald-neon/[0.08] rounded-xl py-4 px-4 cursor-pointer transition-all group"
            >
              <Camera
                size={20}
                className="text-emerald-neon transition-transform group-hover:scale-110"
              />
              <span className="text-sm font-semibold text-emerald-neon">
                التقاط صورة للتمرين
              </span>
            </button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleCameraCapture(e.target.files?.[0] ?? null)}
            />

            {photoPreview && imageData && (
              <div className="mt-3 rounded-xl border border-emerald-neon/25 bg-navy-800/50 p-3 animate-fade-in">
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt={imageData}
                    className="w-full max-h-48 object-contain rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-2 left-2 p-1.5 rounded-lg bg-navy-950/80 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="حذف الصورة"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3 px-2">
                  <ScanLine size={16} className="text-emerald-neon shrink-0" />
                  <p className="text-xs text-emerald-neon leading-relaxed">
                    سيتم تحليل هذه الصورة بالذكاء الاصطناعي لحل التمرين. اضغط "احصل على الحل" للمتابعة.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={solve}
            disabled={(!input.trim() && !imageBase64) || loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                جاري الحل...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                احصل على الحل
              </>
            )}
          </button>

          <button
            onClick={() => setInput(SAMPLE)}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-emerald-neon transition-colors"
          >
            <Lightbulb size={14} />
            جرّب مثالاً: {SAMPLE}
          </button>
        </div>

        {/* Solution panel */}
        <div className="glass rounded-2xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <h3 className="font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-emerald-neon" />
              الحل المفصّل
            </h3>
            <div className="flex items-center gap-2">
              {solution && (
                <button
                  onClick={runSummary}
                  disabled={summarizing}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                    showSummary
                      ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
                      : 'bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon'
                  }`}
                >
                  {summarizing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> جاري التلخيص...
                    </>
                  ) : (
                    <>
                      <ListChecks size={14} /> تلخيص ذكي
                    </>
                  )}
                </button>
              )}
              {solution && (
                <button
                  onClick={copySolution}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> نسخ الحل
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {!solution && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-gray-500">
              <Brain size={48} className="mb-3 opacity-40" />
              <p className="text-sm">
                أدخل تمريناً ثم اضغط "احصل على الحل" لعرض الحل خطوة بخطوة.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 size={40} className="animate-spin text-emerald-neon mb-3" />
              <p className="text-sm">يقوم الذكاء الاصطناعي بتحليل التمرين...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 animate-fade-in">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md">
                <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-400 font-bold mb-2">
                  تعذّر الاتصال بالذكاء الاصطناعي
                </p>
                <p className="text-xs text-gray-300 leading-relaxed break-words mb-1">
                  {error}
                </p>
                <button
                  onClick={runSolve}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon px-4 py-2 rounded-lg transition-colors"
                >
                  <Sparkles size={14} />
                  إعادة المحاولة
                </button>
              </div>
            </div>
          )}

          {solution && !showSummary && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 animate-fade-in">
              <div className="p-3 rounded-xl bg-emerald-neon/10 border border-emerald-neon/20">
                <p className="text-xs text-emerald-neon font-semibold mb-1">
                  {solution.subjectAr} — {solution.topic}
                </p>
                <p className="text-sm text-gray-200 leading-relaxed">
                  {solution.summary}
                </p>
              </div>
              {solution.steps.map((step, i) => (
                <StepCard key={i} step={step} />
              ))}
            </div>
          )}

          {solution && showSummary && (
            <div className="flex-1 space-y-4 overflow-y-auto pr-1 animate-fade-in">
              {summarizing ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 size={36} className="animate-spin text-emerald-neon mb-3" />
                  <p className="text-sm">يتم توليد ملخص مركّز...</p>
                </div>
              ) : summary ? (
                <SummaryCard summary={summary} />
              ) : null}
              <button
                onClick={() => setShowSummary(false)}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-emerald-neon transition-colors pt-2"
              >
                <FileText size={14} /> العودة إلى الحل الكامل
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Ad interstitial — shows at most once per cooldown window */}
      {adOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm animate-fade-in" />
          <div className="relative glass-strong w-full max-w-sm rounded-2xl shadow-glass border border-emerald-neon/20 animate-fade-in p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ExternalLink size={20} className="text-emerald-neon" />
              <h3 className="text-lg font-bold text-white">محتوى داعم</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">
              تم فتح رابط داعم في نافذة جديدة. شكراً لدعمك! انتظر انتهاء العدّاد للانتقال إلى الحل.
            </p>

            {adCountdown > 0 ? (
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-sm text-gray-400">سيظهر زر التخطي خلال</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-neon/15 text-emerald-neon font-bold text-lg">
                  {adCountdown}
                </span>
                <span className="text-sm text-gray-400">ثانية</span>
              </div>
            ) : (
              <div className="h-5 mb-5" />
            )}

            <button
              onClick={skipAd}
              disabled={adCountdown > 0}
              className="w-full flex items-center justify-center gap-2 bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Sparkles size={18} />
              تخطي الإعلان والانتقال إلى الحل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepCard({ step }: { step: SolverStep }) {
  return (
    <div className="p-4 rounded-xl bg-navy-800/40 border border-white/5 hover:border-emerald-neon/20 transition-colors">
      <h4 className="text-sm font-bold text-emerald-neon mb-2">{step.title}</h4>
      {step.math && (
        <div className="my-2 overflow-x-auto">
          <Katex math={step.math} display />
        </div>
      )}
      {step.text && (
        <p className="text-sm text-gray-300 leading-relaxed mt-2">{step.text}</p>
      )}
      {step.bullets && (
        <ul className="mt-2 space-y-1.5">
          {step.bullets.map((b, i) => (
            <li
              key={i}
              className="text-sm text-gray-300 leading-relaxed flex gap-2"
            >
              <span className="text-emerald-neon mt-0.5 shrink-0">◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {step.table && <VariationTable table={step.table} />}
    </div>
  );
}

function VariationTable({ table }: { table: NonNullable<SolverStep['table']> }) {
  return (
    <div className="overflow-x-auto mt-3">
      <Katex
        math={`\\begin{array}{|c|cccccc|c|}\\hline x & & ${table.x
          .map((v) => v)
          .join(' & ')} & \\\\ \\hline f(x) & & ${table.f
          .map((v) => v)
          .join(' & ')} & \\\\ \\hline \\end{array}`}
        display
      />
    </div>
  );
}

function SummaryCard({ summary }: { summary: SmartSummary }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-emerald-neon">
        <ListChecks size={18} />
        <h4 className="text-sm font-bold">تلخيص ذكي</h4>
      </div>
      <ul className="space-y-3">
        {summary.bullets.map((b, i) => (
          <li
            key={i}
            className="flex gap-3 p-3 rounded-xl bg-navy-800/40 border border-emerald-neon/15 animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-lg bg-emerald-neon/15 text-emerald-neon text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-gray-200 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
      <div className="p-4 rounded-xl bg-emerald-neon/10 border border-emerald-neon/25">
        <p className="text-xs text-emerald-neon font-semibold mb-1">
          الخلاصة النهائية
        </p>
        <p className="text-sm text-gray-100 leading-relaxed">
          {summary.finalAnswer}
        </p>
      </div>
    </div>
  );
}

function PageHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
        {icon}
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h2>
        <p className="text-sm text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}
