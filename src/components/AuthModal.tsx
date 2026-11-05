import { useState } from 'react';
import { Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';
import {
  loginWithEmail,
  signUpWithEmail,
  type User,
} from '@/lib/auth';


interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onAuth: (user: User) => void;
}

export default function AuthModal({ open, onClose, onAuth }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setLoading(false);
  };

  const handleFirebaseError = (err: unknown): string => {
    const code =
      (err as { code?: string })?.code ?? '';
    switch (code) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صالح.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.';
      case 'auth/operation-not-allowed':
        return 'تسجيل الدخول بالبريد وكلمة المرور غير مفعّل في Firebase.';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة. حاول مرة أخرى لاحقاً.';
      case 'auth/network-request-failed':
        return 'تحقق من اتصالك بالإنترنت ثم حاول مجدداً.';
      default:
        return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('الرجاء إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('الرجاء إدخال الاسم الكامل.');
      return;
    }

    setLoading(true);
    try {
      const user =
        mode === 'login'
          ? await loginWithEmail(email.trim(), password)
          : await signUpWithEmail(name.trim(), email.trim(), password);
      onAuth(user);
      reset();
      onClose();
    } catch (err) {
      setError(handleFirebaseError(err));
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
    >
      <div className="flex gap-2 mb-5 p-1 bg-navy-800/60 rounded-xl">
        <button
          onClick={() => {
            setMode('login');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'login'
              ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          دخول
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setError('');
          }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            mode === 'signup'
              ? 'bg-emerald-neon text-navy-950 shadow-neon-sm'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          حساب جديد
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && (
          <Field
            icon={<UserIcon size={18} />}
            placeholder="الاسم الكامل"
            value={name}
            onChange={setName}
            type="text"
          />
        )}
        <Field
          icon={<Mail size={18} />}
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <div className="relative">
          <Field
            icon={<Lock size={18} />}
            placeholder="كلمة المرور"
            value={password}
            onChange={setPassword}
            type={show ? 'text' : 'password'}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-neon"
            aria-label="إظهار كلمة المرور"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm hover:shadow-neon disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full animate-spin" />
          ) : mode === 'login' ? (
            'دخول'
          ) : (
            'إنشاء الحساب'
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center pt-4">
        يتم إنشاء حساب حقيقي عبر Firebase Authentication.
      </p>
    </Modal>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}

function Field({ icon, placeholder, value, onChange, type }: FieldProps) {
  return (
    <div className="relative">
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-navy-800/60 border border-white/10 rounded-xl py-3 pr-11 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-neon/60 focus:ring-2 focus:ring-emerald-neon/20 transition-all"
      />
    </div>
  );
}
