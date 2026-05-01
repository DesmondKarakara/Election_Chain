'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import axios from 'axios';
import { Mail, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [digits, setDigits]   = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const inputRefs             = useRef<(HTMLInputElement | null)[]>([]);

  const otp = digits.join('');

  const handleDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/verify-otp`, { email, otp });
      setMessage(response.data.message);
      setTimeout(() => {
        router.push(`/book-slot?email=${encodeURIComponent(email)}`);
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <FlowStepper currentStep={2} />

      <div className="glass-card gradient-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">Verify Email</h1>
          <p className="text-slate-400 text-sm">
            We sent a 6-digit OTP to <strong className="text-slate-200">{email || 'your email'}</strong>
          </p>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert-success mb-6 animate-scale-in" role="alert">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="alert-error mb-6 animate-scale-in" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* OTP digit boxes */}
          <div>
            <label className="field-label text-center block mb-4">One-Time Password</label>
            <div className="flex justify-center gap-3" onPaste={handlePaste} aria-label="Enter 6-digit OTP">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-digit-${i}`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl border transition-all duration-200 outline-none focus:scale-105"
                  style={{
                    background: 'rgba(15,23,42,0.8)',
                    borderColor: d ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    boxShadow: d ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                  }}
                  aria-label={`Digit ${i + 1}`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-600 mt-3">
              You can also paste the full code directly
            </p>
          </div>

          <button
            id="verify-otp-btn"
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying…
              </>
            ) : 'Verify & Continue →'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Didn&apos;t receive the code?{' '}
          <a href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
            Back to registration
          </a>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto">
        <div className="glass-card p-8 animate-pulse">
          <div className="h-8 bg-white/5 rounded-lg mb-4 w-48 mx-auto" />
          <div className="h-4 bg-white/5 rounded mb-8 w-64 mx-auto" />
          <div className="flex gap-3 justify-center">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-12 h-14 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
