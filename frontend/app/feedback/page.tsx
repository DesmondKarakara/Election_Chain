'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { MessageSquare, CheckCircle2, AlertTriangle, Star, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const RATINGS = [
  { value: 5, label: 'Excellent' },
  { value: 4, label: 'Very Good' },
  { value: 3, label: 'Good' },
  { value: 2, label: 'Fair' },
  { value: 1, label: 'Poor' },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '', email: '', walletAddress: '', rating: 0, feedback: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await axios.post(`${API_BASE}/feedback`, formData);
      setMessage('Thank you for your feedback!');
      setFormData({ name: '', email: '', walletAddress: '', rating: 0, feedback: '' });
      setTimeout(() => { router.push('/'); }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="glass-card gradient-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-black mb-2">Share Your Feedback</h1>
          <p className="text-slate-500 text-sm">Help us improve the ElectChain voting experience.</p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="fb-name" className="field-label">Full Name <span className="text-rose-400">*</span></label>
              <input id="fb-name" type="text" name="name" value={formData.name}
                onChange={handleChange} required className="field-input" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="fb-email" className="field-label">Email <span className="text-rose-400">*</span></label>
              <input id="fb-email" type="email" name="email" value={formData.email}
                onChange={handleChange} required className="field-input" placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label htmlFor="fb-wallet" className="field-label">Wallet Address <span className="text-rose-400">*</span></label>
            <input id="fb-wallet" type="text" name="walletAddress" value={formData.walletAddress}
              onChange={handleChange} required className="field-input font-mono text-sm" placeholder="0x…" spellCheck={false} />
          </div>

          {/* Star rating selector */}
          <div>
            <legend className="field-label mb-3">Overall Rating <span className="text-rose-500">*</span></legend>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {RATINGS.map((r) => {
                const isSelected = formData.rating === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: r.value })}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-slate-900 border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex gap-0.5 mb-1 justify-center">
                      {Array.from({ length: r.value }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${isSelected ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/80 text-amber-400/80'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {r.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="fb-message" className="field-label">Your Feedback <span className="text-rose-400">*</span></label>
            <textarea
              id="fb-message"
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              required
              rows={5}
              className="field-input resize-none"
              placeholder="What did you like? What could be improved? Any suggestions for the next version?"
            />
            <p className="text-xs text-slate-600 mt-1">
              {formData.feedback.length}/1000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Feedback…
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5" /> Submit Feedback
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">← Back to Home</a>
        </div>
      </div>
    </div>
  );
}
