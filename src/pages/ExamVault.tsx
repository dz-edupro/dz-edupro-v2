import { useMemo, useState } from 'react';
import { Archive, FileText, ChevronLeft, Eye, CircleCheck as CheckCircle2, BookOpen, FolderOpen, Layers, CirclePlay as PlayCircle, ExternalLink, GraduationCap, Award, Trophy } from 'lucide-react';
import {
  LEVEL_GROUPS,
  streamsForLevel,
  streamInfo,
  subjectsForLevel,
  isHighSchool,
  type SubjectInfo,
  type StreamKey,
} from '@/lib/constants';
import {
  CATEGORIES,
  getModelCount,
  getCategoryModelCount,
  getModels,
  getVideos,
  getBemExams,
  getBacExams,
  archiveCategoryForLevel,
  type ExamModel,
  type SolverContext,
  type CategoryInfo,
  type OfficialExam,
} from '@/lib/exams';
import ExamDetailList, { type ExamDetailEntry, type ExamDetailSelection } from '@/components/ExamDetailList';

type View = 'levels' | 'streams' | 'subjects' | 'categories' | 'models' | 'bem' | 'bac' | 'detail';

function toDetailEntry(exam: OfficialExam): ExamDetailEntry {
  return {
    id: exam.id,
    title: exam.title,
    year: exam.year,
    hasSolution: exam.hasCorrection,
    downloads: exam.downloads,
  };
}

export default function ExamVault({ onSolve }: { onSolve: (context: SolverContext) => void }) {
  const [view, setView] = useState<View>('levels');
  const [levelId, setLevelId] = useState('');
  const [levelAr, setLevelAr] = useState('');
  const [streamKey, setStreamKey] = useState<StreamKey | undefined>(undefined);
  const [subject, setSubject] = useState<SubjectInfo | null>(null);
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [detail, setDetail] = useState<ExamDetailSelection | null>(null);
  const [detailReturn, setDetailReturn] = useState<View>('levels');

  const openDetail = (selection: ExamDetailSelection, returnView: View) => {
    setDetail(selection);
    setDetailReturn(returnView);
    setView('detail');
  };

  const goLevels = () => {
    setView('levels');
    setLevelId('');
    setLevelAr('');
    setStreamKey(undefined);
    setSubject(null);
    setCategory(null);
  };

  const goStreams = (id: string, ar: string) => {
    setLevelId(id);
    setLevelAr(ar);
    setStreamKey(undefined);
    setSubject(null);
    setCategory(null);
    setView(isHighSchool(id) ? 'streams' : 'subjects');
  };

  const goSubjects = (sk?: StreamKey) => {
    setStreamKey(sk);
    setSubject(null);
    setCategory(null);
    setView('subjects');
  };

  const goCategories = (s: SubjectInfo) => {
    setSubject(s);
    setCategory(null);
    setView('categories');
  };

  const goModels = (c: CategoryInfo) => {
    setCategory(c);
    setView('models');
  };

  const goBem = () => {
    setView('bem');
    setLevelId('');
    setLevelAr('');
    setStreamKey(undefined);
    setSubject(null);
    setCategory(null);
  };

  const goBac = () => {
    setView('bac');
    setLevelId('');
    setLevelAr('');
    setStreamKey(undefined);
    setSubject(null);
    setCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
          <Archive size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">بنك الامتحانات والاختبارات</h2>
          <p className="text-sm text-gray-400">المنهاج الجزائري — متوسط وثانوي · روابط مباشرة لمصادر حقيقية</p>
        </div>
      </div>

      <Breadcrumb
        view={view}
        levelAr={levelAr}
        streamAr={streamKey ? streamInfo(streamKey)?.shortAr ?? '' : ''}
        subjectAr={subject?.ar ?? ''}
        categoryAr={category?.ar ?? ''}
        onLevel={goLevels}
        onStream={() => setView('streams')}
        onSubject={() => setView('subjects')}
        onCategory={() => subject && setView('categories')}
      />

      {view === 'levels' && (
        <>
          <QuickAccessGrid onBem={goBem} onBac={goBac} />
          <LevelGrid onSelect={goStreams} />
        </>
      )}

      {view === 'streams' && (
        <StreamGrid levelId={levelId} levelAr={levelAr} onSelect={(sk) => goSubjects(sk)} />
      )}

      {view === 'subjects' && (
        <>
          <SubjectGrid
            levelId={levelId}
            levelAr={levelAr}
            streamKey={streamKey}
            onSelect={goCategories}
          />
          {subject && (
            <VideoSection
              levelId={levelId}
              levelAr={levelAr}
              subject={subject}
              streamKey={streamKey}
              category={CATEGORIES[0]}
            />
          )}
        </>
      )}

      {view === 'categories' && subject && (
        <CategoryGrid
          levelId={levelId}
          subjectKey={subject.key}
          streamKey={streamKey}
          onSelect={goModels}
        />
      )}

      {view === 'models' && subject && category && (
        <ModelTable
          levelId={levelId}
          levelAr={levelAr}
          subject={subject}
          category={category}
          streamKey={streamKey}
          onView={(selection) => openDetail(selection, 'models')}
        />
      )}
      {view === 'bem' && <BemSection onView={(selection) => openDetail(selection, 'bem')} />}
      {view === 'bac' && <BacSection onView={(selection) => openDetail(selection, 'bac')} />}
      {view === 'detail' && detail && (
        <ExamDetailList
          selection={detail}
          onBack={() => setView(detailReturn)}
          onSolve={onSolve}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick access — BEM & BAC                                           */
/* ------------------------------------------------------------------ */

function QuickAccessGrid({
  onBem,
  onBac,
}: {
  onBem: () => void;
  onBac: () => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
        <Trophy size={16} className="text-amber-400" />
        امتحانات رسمية
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={onBem}
          className="glass rounded-xl p-4 flex items-center gap-3 hover:border-amber-400/40 border border-transparent transition-all group text-right"
        >
          <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 group-hover:bg-amber-400/25 transition-colors shrink-0">
            <Award size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-white">بنك شهادة التعليم المتوسط (BEM)</span>
            <span className="block text-[11px] text-gray-500 mt-0.5">امتحانات BEM الرسمية بالتصحيح 2020–2025</span>
          </div>
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-amber-400 transition-colors shrink-0" />
        </button>
        <button
          onClick={onBac}
          className="glass rounded-xl p-4 flex items-center gap-3 hover:border-amber-400/40 border border-transparent transition-all group text-right"
        >
          <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 group-hover:bg-amber-400/25 transition-colors shrink-0">
            <Trophy size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-white">بنك شهادة البكالوريا (BAC)</span>
            <span className="block text-[11px] text-gray-500 mt-0.5">امتحانات BAC الرسمية حسب الشعب بالتصحيح 2020–2025</span>
          </div>
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-amber-400 transition-colors shrink-0" />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                         */
/* ------------------------------------------------------------------ */

function Breadcrumb({
  view,
  levelAr,
  streamAr,
  subjectAr,
  categoryAr,
  onLevel,
  onStream,
  onSubject,
  onCategory,
}: {
  view: View;
  levelAr: string;
  streamAr: string;
  subjectAr: string;
  categoryAr: string;
  onLevel: () => void;
  onStream: () => void;
  onSubject: () => void;
  onCategory: () => void;
}) {
  if (view === 'levels') return null;
  return (
    <div className="flex items-center gap-1.5 text-sm flex-wrap">
      <button onClick={onLevel} className="text-gray-400 hover:text-emerald-neon transition-colors">
        المستويات
      </button>
      <ChevronLeft size={14} className="text-gray-600" />
      <button onClick={onStream} className="text-gray-400 hover:text-emerald-neon transition-colors">
        {levelAr}
      </button>
      {streamAr && view !== 'streams' && (
        <>
          <ChevronLeft size={14} className="text-gray-600" />
          <button onClick={onSubject} className="text-gray-400 hover:text-emerald-neon transition-colors">
            {streamAr}
          </button>
        </>
      )}
      {subjectAr && view !== 'subjects' && (
        <>
          <ChevronLeft size={14} className="text-gray-600" />
          <button onClick={onCategory} className="text-gray-400 hover:text-emerald-neon transition-colors">
            {subjectAr}
          </button>
        </>
      )}
      {categoryAr && view === 'models' && (
        <>
          <ChevronLeft size={14} className="text-gray-600" />
          <span className="text-emerald-neon font-semibold">{categoryAr}</span>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 1 — Level grid                                               */
/* ------------------------------------------------------------------ */

function LevelGrid({ onSelect }: { onSelect: (id: string, ar: string) => void }) {
  return (
    <div className="space-y-6">
      {LEVEL_GROUPS.map((group) => (
        <div key={group.stage}>
          <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
            <Layers size={16} className="text-emerald-neon" />
            {group.stage}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {group.levels.map((level) => (
              <button
                key={level.id}
                onClick={() => onSelect(level.id, level.ar)}
                className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
              >
                <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors">
                  <BookOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-emerald-neon mb-0.5">{level.id}</span>
                  <span className="block text-sm text-white truncate">{level.ar}</span>
                </div>
                <ChevronLeft size={18} className="text-gray-600 group-hover:text-emerald-neon transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 2 — Stream grid (high school only)                           */
/* ------------------------------------------------------------------ */

function StreamGrid({
  levelId,
  levelAr,
  onSelect,
}: {
  levelId: string;
  levelAr: string;
  onSelect: (sk: StreamKey) => void;
}) {
  const streams = useMemo(() => streamsForLevel(levelId), [levelId]);
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
        <GraduationCap size={16} className="text-emerald-neon" />
        الشعب الدراسية — {levelAr}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {streams.map((stream) => (
          <button
            key={stream.key}
            onClick={() => onSelect(stream.key)}
            className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
          >
            <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors">
              <GraduationCap size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm text-white truncate">{stream.ar}</span>
            </div>
            <ChevronLeft size={18} className="text-gray-600 group-hover:text-emerald-neon transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 3 — Subject grid                                             */
/* ------------------------------------------------------------------ */

function SubjectGrid({
  levelId,
  levelAr,
  streamKey,
  onSelect,
}: {
  levelId: string;
  levelAr: string;
  streamKey?: StreamKey;
  onSelect: (s: SubjectInfo) => void;
}) {
  const subjects = useMemo(
    () => subjectsForLevel(levelId, streamKey),
    [levelId, streamKey]
  );
  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
        <BookOpen size={16} className="text-emerald-neon" />
        المواد — {levelAr}
        {streamKey && (
          <span className="text-emerald-neon/70">
            · {streamInfo(streamKey)?.shortAr}
          </span>
        )}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {subjects.map((s) => {
          const count = getModelCount(levelId, s.key, streamKey);
          return (
            <button
              key={s.key}
              onClick={() => onSelect(s)}
              className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
            >
              <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors">
                <FileText size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-sm text-white truncate">{s.ar}</span>
                <span className="block text-[11px] text-gray-500 mt-0.5">{count} ملف</span>
              </div>
              <ChevronLeft size={18} className="text-gray-600 group-hover:text-emerald-neon transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 4 — Category grid                                            */
/* ------------------------------------------------------------------ */

function CategoryGrid({
  levelId,
  subjectKey,
  streamKey,
  onSelect,
}: {
  levelId: string;
  subjectKey: SubjectInfo['key'];
  streamKey?: StreamKey;
  onSelect: (c: CategoryInfo) => void;
}) {
  const archive = archiveCategoryForLevel(levelId);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
        <FolderOpen size={16} className="text-emerald-neon" />
        التصنيفات
      </h3>

      {/* Prominent BEM/BAC archive card for final-year levels */}
      {archive && (
        <button
          onClick={() => onSelect(archive)}
          className="w-full glass rounded-xl p-4 flex items-center gap-3 hover:border-amber-400/50 border border-amber-400/20 transition-all group text-right bg-amber-400/[0.03]"
        >
          <div className="p-2.5 rounded-xl bg-amber-400/15 text-amber-400 group-hover:bg-amber-400/25 transition-colors shrink-0">
            {levelId === '4AM' ? <Award size={22} /> : <Trophy size={22} />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-white">{archive.ar}</span>
            <span className="block text-[11px] text-amber-400/70 mt-0.5">
              مواضيع سابقة بالتصحيح 2020–2025
            </span>
          </div>
          <ChevronLeft size={18} className="text-gray-600 group-hover:text-amber-400 transition-colors shrink-0" />
        </button>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const count = getCategoryModelCount(levelId, subjectKey, cat.id, streamKey);
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
            >
                <div className="p-2.5 rounded-xl bg-emerald-neon/15 text-emerald-neon group-hover:bg-emerald-neon/25 transition-colors">
                  <FolderOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-sm text-white truncate">{cat.ar}</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">{count} نموذج</span>
                </div>
                <ChevronLeft size={18} className="text-gray-600 group-hover:text-emerald-neon transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Level 5 — Model table                                              */
/* ------------------------------------------------------------------ */

function ModelTable({
  levelId,
  levelAr,
  subject,
  category,
  streamKey,
  onView,
}: {
  levelId: string;
  levelAr: string;
  subject: SubjectInfo;
  category: CategoryInfo;
  streamKey?: StreamKey;
  onView: (selection: ExamDetailSelection) => void;
}) {
  const models = useMemo(
    () => getModels(levelId, levelAr, subject, category, streamKey),
    [levelId, levelAr, subject, category, streamKey]
  );

  const selection: ExamDetailSelection = {
    heading: `${category.ar} — ${subject.ar}`,
    subheading: [levelAr, streamKey ? streamInfo(streamKey)?.shortAr : ''].filter(Boolean).join(' · '),
    subjectKey: subject.key,
    entries: models.map((m) => ({
      id: m.id,
      title: m.title,
      year: m.year,
      hasSolution: m.hasCorrection,
      downloads: m.downloads,
    })),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2">
        <FileText size={16} className="text-emerald-neon" />
        {category.ar} — {subject.ar}
      </h3>

      {models.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p>لا توجد نماذج متاحة في هذا التصنيف.</p>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <table className="w-full text-sm hidden md:table">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-right py-3 px-4 font-semibold">العنوان</th>
                <th className="text-center py-3 px-4 font-semibold w-20">السنة</th>
                <th className="text-center py-3 px-4 font-semibold w-24">الحل</th>
                <th className="text-center py-3 px-4 font-semibold w-24">التحميلات</th>
                <th className="text-center py-3 px-4 font-semibold w-40">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 px-4 text-white text-right">
                    <span className="block text-[10px] text-emerald-neon font-bold mb-0.5">{m.levelId}</span>
                    {m.title}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-400">{m.year}</td>
                  <td className="py-3 px-4 text-center">
                    {m.hasCorrection ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-neon bg-emerald-neon/10 px-2 py-0.5 rounded">
                        <CheckCircle2 size={12} /> حل
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500 text-xs">{m.downloads}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(selection)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye size={13} /> عرض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {models.map((m) => (
              <div key={m.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] text-emerald-neon font-bold mb-0.5">{m.levelId}</span>
                    <p className="text-sm text-white leading-snug">{m.title}</p>
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0">{m.year}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {m.hasCorrection && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-neon bg-emerald-neon/10 px-2 py-0.5 rounded">
                        <CheckCircle2 size={11} /> حل
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">{m.downloads} تحميل</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onView(selection)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg"
                    >
                      <Eye size={12} /> عرض
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video explanations section */}
      <VideoSection
        levelId={levelId}
        levelAr={levelAr}
        subject={subject}
        streamKey={streamKey}
        category={category}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Video explanations section                                         */
/* ------------------------------------------------------------------ */

function VideoSection({
  levelId,
  levelAr,
  subject,
  streamKey,
  category,
}: {
  levelId: string;
  levelAr: string;
  subject: SubjectInfo;
  streamKey?: StreamKey;
  category: CategoryInfo;
}) {
  const videos = useMemo(
    () => getVideos(levelId, levelAr, subject, streamKey, category),
    [levelId, levelAr, subject, streamKey, category]
  );

  const termLabel = (() => {
    if (category.id.endsWith('_t1')) return 'الفصل الأول';
    if (category.id.endsWith('_t2')) return 'الفصل الثاني';
    if (category.id.endsWith('_t3')) return 'الفصل الثالث';
    if (category.id === 'bem_archive') return 'مواضيع BEM';
    if (category.id === 'bac_archive') return 'مواضيع BAC';
    return '';
  })();

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
        <PlayCircle size={16} className="text-emerald-neon" />
        فيديوهات الشرح — {subject.ar}
        {termLabel && (
          <span className="text-emerald-neon/70 text-xs">· {termLabel}</span>
        )}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {videos.map((v, i) => (
          <a
            key={i}
            href={v.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-neon/40 border border-transparent transition-all group text-right"
          >
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 group-hover:bg-red-500/25 transition-colors shrink-0">
              <PlayCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm text-white truncate leading-snug">{v.title}</span>
              <span className="block text-[11px] text-gray-500 mt-0.5">{v.channel}</span>
            </div>
            <ExternalLink size={16} className="text-gray-600 group-hover:text-emerald-neon transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Official exam card (shared by BEM & BAC)                           */
/* ------------------------------------------------------------------ */

function OfficialExamCard({ exam, onView }: { exam: OfficialExam; onView: () => void }) {
  return (
    <div className="glass rounded-xl p-4 flex flex-col gap-3 hover:border-emerald-neon/40 border border-transparent transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white leading-snug font-semibold">{exam.title}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {exam.hasCorrection && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-neon bg-emerald-neon/10 px-2 py-0.5 rounded">
                <CheckCircle2 size={11} /> حل وتصحيح
              </span>
            )}
            <span className="text-[10px] text-gray-500">{exam.downloads} تحميل</span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded shrink-0">
          {exam.year}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-neon text-navy-950 hover:bg-emerald-bright px-2.5 py-1.5 rounded-lg transition-colors flex-1 justify-center"
        >
          <Eye size={13} /> عرض
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BEM section                                                        */
/* ------------------------------------------------------------------ */

function BemSection({ onView }: { onView: (selection: ExamDetailSelection) => void }) {
  const [yearFilter, setYearFilter] = useState('');
  const exams = useMemo(() => getBemExams(), []);

  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];
  const filtered = yearFilter ? exams.filter((e) => e.year === yearFilter) : exams;

  const openExam = (exam: OfficialExam) =>
    onView({
      heading: exam.subjectAr,
      subheading: exam.levelLabel,
      subjectKey: exam.subjectKey,
      entries: exams.filter((e) => e.subjectAr === exam.subjectAr).map(toDetailEntry),
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-400/15 text-amber-400">
          <Award size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">بنك شهادة التعليم المتوسط (BEM)</h2>
          <p className="text-sm text-gray-400">امتحانات BEM الرسمية بالتصحيح — جميع المواد 2020–2025</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setYearFilter('')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            !yearFilter ? 'bg-amber-400 text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
          }`}
        >
          الكل
        </button>
        {years.map((y) => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              yearFilter === y ? 'bg-amber-400 text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((exam) => (
          <OfficialExamCard key={exam.id} exam={exam} onView={() => openExam(exam)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  BAC section                                                        */
/* ------------------------------------------------------------------ */

function BacSection({ onView }: { onView: (selection: ExamDetailSelection) => void }) {
  const [streamFilter, setStreamFilter] = useState<StreamKey | ''>('');
  const [yearFilter, setYearFilter] = useState('');
  const exams = useMemo(() => getBacExams(), []);

  const bacStreams = streamsForLevel('3AS');
  const years = ['2025', '2024', '2023', '2022', '2021', '2020'];

  const openExam = (exam: OfficialExam) =>
    onView({
      heading: exam.subjectAr,
      subheading: `${exam.levelLabel} · ${exam.streamLabel}`,
      subjectKey: exam.subjectKey,
      entries: exams
        .filter((e) => e.subjectAr === exam.subjectAr && e.streamLabel === exam.streamLabel)
        .map(toDetailEntry),
    });

  const filtered = exams.filter((e) => {
    if (streamFilter && !e.id.startsWith(`bac-${streamFilter}-`)) return false;
    if (yearFilter && e.year !== yearFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-400/15 text-amber-400">
          <Trophy size={24} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">بنك شهادة البكالوريا (BAC)</h2>
          <p className="text-sm text-gray-400">امتحانات BAC الرسمية حسب الشعب بالتصحيح — 2020–2025</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStreamFilter('')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              !streamFilter ? 'bg-amber-400 text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            جميع الشعب
          </button>
          {bacStreams.map((s) => (
            <button
              key={s.key}
              onClick={() => setStreamFilter(s.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                streamFilter === s.key ? 'bg-amber-400 text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {s.shortAr}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setYearFilter('')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              !yearFilter ? 'bg-emerald-neon text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            كل السنوات
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                yearFilter === y ? 'bg-emerald-neon text-navy-950' : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((exam) => (
          <OfficialExamCard key={exam.id} exam={exam} onView={() => openExam(exam)} />
        ))}
      </div>
    </div>
  );
}
