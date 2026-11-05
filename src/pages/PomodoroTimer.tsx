import { useEffect, useRef, useState } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type Mode = 'focus' | 'break';
const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>('focus');
  const [seconds, setSeconds] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          // Cycle complete
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setRunning(false);
          if (mode === 'focus') {
            setCycles((c) => c + 1);
            setMode('break');
            return BREAK_SECONDS;
          } else {
            setMode('focus');
            return FOCUS_SECONDS;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setSeconds(mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const switchMode = (m: Mode) => {
    setRunning(false);
    setMode(m);
    setSeconds(m === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS);
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const total = mode === 'focus' ? FOCUS_SECONDS : BREAK_SECONDS;
  const progress = ((total - seconds) / total) * 100;

  // SVG ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-neon/15 text-emerald-neon shadow-neon-sm">
          <Timer size={24} />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">مؤقت المراجعة (بومودورو)</h2>
          <p className="text-sm text-gray-400">25 دقيقة تركيز · 5 دقائق استراحة</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 sm:p-10 flex flex-col items-center gap-8">
        {/* Mode toggle */}
        <div className="flex gap-2 p-1 bg-navy-800/60 rounded-xl">
          <button
            onClick={() => switchMode('focus')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'focus'
                ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Brain size={16} />
            تركيز
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'break'
                ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Coffee size={16} />
            استراحة
          </button>
        </div>

        {/* Timer ring */}
        <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px]">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 280 280"
          >
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="#1a253f"
              strokeWidth="12"
            />
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="#00e676"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                transition: 'stroke-dashoffset 1s linear',
                filter: 'drop-shadow(0 0 8px rgba(0,230,118,0.6))',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono tracking-tight">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
            <span className="text-sm text-gray-400 mt-2">
              {mode === 'focus' ? 'وقت التركيز' : 'وقت الاستراحة'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`flex items-center gap-2 font-bold py-3 px-8 rounded-xl transition-all shadow-neon-sm ${
              running
                ? 'bg-navy-700 text-white hover:bg-navy-600'
                : 'bg-emerald-neon text-navy-950 hover:bg-emerald-bright'
            }`}
          >
            {running ? (
              <>
                <Pause size={20} /> إيقاف مؤقت
              </>
            ) : (
              <>
                <Play size={20} /> ابدأ
              </>
            )}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 font-semibold bg-navy-800/60 border border-white/10 text-gray-300 hover:text-white py-3 px-6 rounded-xl transition-colors"
          >
            <RotateCcw size={18} />
            إعادة
          </button>
        </div>

        {/* Cycles */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>دورات مكتملة:</span>
          <span className="text-emerald-neon font-bold text-lg">{cycles}</span>
          <span>جلسة تركيز</span>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 text-center text-sm text-gray-400">
        تقنية بومودورو: راجع بتركيز تام لمدة 25 دقيقة، ثم خذ استراحة قصيرة 5 دقائق. كرر الدورة لزيادة الإنتاجية.
      </div>
    </div>
  );
}
