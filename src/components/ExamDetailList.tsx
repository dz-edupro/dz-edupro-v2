import { useMemo } from 'react';
import { ArrowRight, CircleCheck as CheckCircle2, Eye, FileText } from 'lucide-react';

export interface ExamDetailEntry {
  id: string;
  title: string;
  year: string;
  hasSolution: boolean;
  downloads: number;
}

export interface ExamDetailSelection {
  heading: string;
  subheading: string;
  entries: ExamDetailEntry[];
}

export default function ExamDetailList({
  selection,
  onBack,
  onOpen,
}: {
  selection: ExamDetailSelection;
  onBack: () => void;
  onOpen: (entry: ExamDetailEntry) => void;
}) {
  const groups = useMemo(() => {
    const byYear = new Map<string, ExamDetailEntry[]>();
    for (const entry of selection.entries) {
      const list = byYear.get(entry.year) ?? [];
      list.push(entry);
      byYear.set(entry.year, list);
    }
    return [...byYear.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [selection.entries]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-neon transition-colors"
      >
        <ArrowRight size={16} />
        رجوع
      </button>

      <div>
        <h3 className="text-lg font-extrabold text-white">{selection.heading}</h3>
        <p className="text-sm text-gray-400">{selection.subheading}</p>
      </div>

      {groups.length === 0 ? (
        <div className="glass rounded-2xl py-16 text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-3 opacity-40" />
          <p>لا توجد مواضيع متاحة لهذا الاختيار.</p>
        </div>
      ) : (
        groups.map(([year, entries]) => (
          <section key={year} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                {year}
              </span>
              <span className="text-[11px] text-gray-500">{entries.length} موضوع</span>
            </div>
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => onOpen(entry)}
                    className="group w-full glass rounded-xl p-4 flex items-center justify-between gap-3 text-right hover:border-emerald-neon/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{entry.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">{entry.downloads} تحميل</span>
                        {entry.hasSolution ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-neon">
                            <CheckCircle2 size={11} /> حل متوفر
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500">بدون حل</span>
                        )}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 shrink-0 text-xs font-bold bg-emerald-neon text-navy-950 group-hover:bg-emerald-bright px-3 py-2 rounded-lg shadow-neon-sm transition-colors">
                      <Eye size={14} /> عرض
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
