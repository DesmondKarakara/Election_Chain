'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FileEdit, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    walletAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/register`, formData);
      setMessage(response.data.message);
      setFormData({ fullName: '', email: '', phone: '', walletAddress: '' });
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(response.data.email)}`);
      }, 1800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <FlowStepper currentStep={1} />

      <div className="glass-card gradient-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <FileEdit className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">Voter Registration</h1>
          <p className="text-slate-500 text-sm">Create your secure voter account</p>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert-success mb-6 animate-scale-in" role="alert">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message} Redirecting to OTP verification…</span>
          </div>
        )}
        {error && (
          <div className="alert-error mb-6 animate-scale-in" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reg-fullName" className="field-label">Full Name <span className="text-rose-400">*</span></label>
            <input
              id="reg-fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="Alice Johnson"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="field-label">Email Address <span className="text-rose-400">*</span></label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="field-input"
              placeholder="alice@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="field-label">Phone <span className="text-slate-600">(optional)</span></label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="field-input"
              placeholder="+1-555-0000"
              autoComplete="tel"
            />
          </div>

          <div>
            <label htmlFor="reg-wallet" className="field-label">Stellar Wallet <span className="text-rose-400">*</span></label>
            <input
              id="reg-wallet"
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              required
              className="field-input font-mono text-sm"
              placeholder="GABC1234…"
              spellCheck={false}
            />
            <p className="text-xs text-slate-600 mt-1.5">Must be a valid Stellar public key (G…)</p>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registering…
              </>
            ) : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already registered?{' '}
          <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
