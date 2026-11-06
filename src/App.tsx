import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Sidebar, { type PageKey } from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import HomeworkSolver from '@/pages/HomeworkSolver';
import ExamVault from '@/pages/ExamVault';
import GradeCalculator from '@/pages/GradeCalculator';
import PomodoroTimer from '@/pages/PomodoroTimer';
import {
  subscribeToAuth,
  logoutUser,
  type User,
} from '@/lib/auth';
import type { SolverContext } from '@/lib/exams';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [page, setPage] = useState<PageKey>('solver');
  const [solverContext, setSolverContext] = useState<SolverContext | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  const handleAuth = (u: User) => setUser(u);
  const handleLogout = () => {
    logoutUser();
  };

  const navigate = (key: PageKey) => {
    setSolverContext(null);
    setPage(key);
  };

  const openSolver = (context: SolverContext) => {
    setSolverContext(context);
    setPage('solver');
  };

  return (
    <div className="app-bg min-h-screen">
      <Header
        user={authReady ? user : null}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />

      <div className="flex">
        <Sidebar
          current={page}
          onNavigate={navigate}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl mx-auto w-full">
          {page === 'solver' && <HomeworkSolver context={solverContext} />}
          {page === 'vault' && <ExamVault onSolve={openSolver} />}
          {page === 'calculator' && <GradeCalculator />}
          {page === 'pomodoro' && <PomodoroTimer />}

          <footer className="mt-12 pt-6 border-t border-white/5 text-center text-xs text-gray-500">
            <p>DZ-EduPro — منصة تعليمية للطلاب الجزائريين</p>
            <p className="mt-1">جميع الحقوق محفوظة © 2026</p>
          </footer>
        </main>
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuth={handleAuth}
      />
    </div>
  );
}

export default App;
