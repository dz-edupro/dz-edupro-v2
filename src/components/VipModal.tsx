import { useRef, useState } from 'react';
import { Upload, Crown, Check, Copy, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';
import { VIP, VIP_LABELS } from '@/lib/constants';
import type { User } from '@/lib/auth';

interface VipModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onVipActivated: () => void;
}

export default function VipModal({
  open,
  onClose,
  user,
  onVipActivated,
}: VipModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setCopied(false);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const copyRip = async () => {
    try {
      await navigator.clipboard.writeText(VIP.rip);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStatus('success');
    onVipActivated();
    setTimeout(() => {
      reset();
      onClose();
    }, 2600);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={VIP_LABELS.title}
      maxWidth="max-w-lg"
    >
      <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-emerald-neon/10 border border-emerald-neon/30">
        <div className="p-2.5 rounded-xl bg-emerald-neon/20">
          <Crown className="text-emerald-neon" size={26} />
        </div>
        <div>
          <p className="font-bold text-white">{VIP_LABELS.subtitle}</p>
          <p className="text-sm text-emerald-neon font-semibold mt-0.5">
            {VIP.price} {VIP.currency} / شهرياً
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="text-center py-8 animate-fade-in">
          <div className="inline-flex p-4 rounded-full bg-emerald-neon/20 mb-4">
            <Check className="text-emerald-neon" size={40} />
          </div>
          <p className="text-white font-bold text-lg mb-1">{VIP_LABELS.thanks}</p>
          <p className="text-gray-400 text-sm">{VIP_LABELS.pending}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {!user && (
            <p className="text-yellow-400/90 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
              الرجاء تسجيل الدخول أولاً لإتمام طلب الاشتراك.
            </p>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {VIP_LABELS.ripLabel}
            </label>
            <div className="flex items-center gap-2 bg-navy-800/60 border border-white/10 rounded-xl p-3">
              <code dir="ltr" className="flex-1 text-emerald-neon font-mono text-base tracking-wider">
                {VIP.rip}
              </code>
              <button
                type="button"
                onClick={copyRip}
                className="p-2 rounded-lg bg-emerald-neon/15 hover:bg-emerald-neon/25 text-emerald-neon transition-colors"
                aria-label="نسخ RIP"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              استخدم تطبيق BaridiMob أو مكتب البريد (CCP) لتحويل المبلغ إلى هذا الحساب.
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              {VIP_LABELS.uploadTitle}
            </label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-white/15 hover:border-emerald-neon/50 rounded-xl p-6 text-center transition-colors group"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={preview}
                    alt="معاينة الوصل"
                    className="max-h-40 rounded-lg border border-white/10"
                  />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ImageIcon size={14} /> {file?.name}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-emerald-neon transition-colors">
                  <Upload size={28} />
                  <span className="text-sm">اضغط لرفع صورة وصل الدفع</span>
                  <span className="text-xs text-gray-500">PNG, JPG — حتى 5MB</span>
                </div>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <button
            type="submit"
            disabled={!file || !user}
            className="w-full bg-emerald-neon text-navy-950 font-bold py-3 rounded-xl hover:bg-emerald-bright transition-colors shadow-neon-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {VIP_LABELS.submit}
          </button>
        </form>
      )}
    </Modal>
  );
}
