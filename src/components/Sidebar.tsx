import { Brain, Archive, Calculator, Timer, X } from 'lucide-react';

export type PageKey = 'solver' | 'vault' | 'calculator' | 'pomodoro';

interface NavItem {
  key: PageKey;
  label: string;
  icon: React.ReactNode;
  desc: string;
}

const NAV: NavItem[] = [
  {
    key: 'solver',
    label: 'حل الواجبات بالذكاء الاصطناعي',
    icon: <Brain size={20} />,
    desc: 'حل خطوة بخطوة',
  },
  {
    key: 'vault',
    label: 'بنك الامتحانات والاختبارات',
    icon: <Archive size={20} />,
    desc: 'مناهج جزائرية',
  },
  {
    key: 'calculator',
    label: 'حساب المعدلات',
    icon: <Calculator size={20} />,
    desc: 'الطريقة الرسمية',
  },
  {
    key: 'pomodoro',
    label: 'مؤقت المراجعة (بومودورو)',
    icon: <Timer size={20} />,
    desc: '25 دقيقة تركيز',
  },
];

interface SidebarProps {
  current: PageKey;
  onNavigate: (key: PageKey) => void;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ current, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-16 right-0 z-40 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-64 glass-strong lg:bg-transparent lg:backdrop-blur-0 lg:border-0 border-l border-white/10 p-4 transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-white font-bold">القائمة</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-neon hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {NAV.map((item) => {
            const active = current === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-right transition-all group ${
                  active
                    ? 'bg-emerald-neon/15 border border-emerald-neon/30 shadow-neon-sm'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <span
                  className={`shrink-0 p-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-emerald-neon text-navy-950'
                      : 'bg-navy-800/60 text-gray-400 group-hover:text-emerald-neon'
                  }`}
                >
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-semibold truncate ${
                      active ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-gray-500 truncate">
                    {item.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-emerald-neon/10 to-transparent border border-emerald-neon/20">
          <p className="text-xs text-gray-300 leading-relaxed">
            منصة تعليمية مجانية للطلاب الجزائريين — حلول، امتحانات، أدوات مراجعة.
          </p>
        </div>
      </aside>
    </>
  );
}
