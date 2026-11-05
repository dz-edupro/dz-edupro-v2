import { GraduationCap, Menu, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/auth';

interface HeaderProps {
  user: User | null;
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  user,
  onToggleSidebar,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-emerald-neon hover:bg-white/5 transition-colors"
            aria-label="القائمة"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-neon/15 shadow-neon-sm">
              <GraduationCap className="text-emerald-neon" size={24} />
            </div>
            <div className="leading-tight">
              <h1 className="font-display font-extrabold text-white text-lg tracking-tight">
                DZ-Edu<span className="neon-text">Pro</span>
              </h1>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                منصة الطلاب الجزائريين
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-800/60 border border-white/10">
                <UserIcon size={16} className="text-emerald-neon" />
                <span className="text-sm text-gray-200 max-w-[120px] truncate">
                  {user.name}
                </span>
                {user.isVip && (
                  <span className="text-[10px] font-bold bg-emerald-neon text-navy-950 px-1.5 py-0.5 rounded">
                    VIP
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="تسجيل الخروج"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-sm font-semibold bg-emerald-neon text-navy-950 hover:bg-emerald-bright px-4 py-2 rounded-xl transition-colors shadow-neon-sm"
            >
              <LogIn size={16} />
              <span>دخول</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
