'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Key, Info, AlertTriangle, EyeOff, Eye, Vote, Loader2 } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/login`, credentials);
      localStorage.setItem('votingToken', response.data.votingToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setTimeout(() => { router.push('/ballot'); }, 800);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto animate-slide-up">
      <FlowStepper currentStep={4} />

      <div className="glass-card gradient-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">Voter Login</h1>
          <p className="text-slate-500 text-sm">Enter your single-use credentials to access the ballot</p>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-3 p-4 mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm leading-relaxed">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-400" />
          <p>You can only log in during your assigned 30-minute window. Credentials expire immediately after voting.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-error mb-6 animate-scale-in" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-username" className="field-label">Username <span className="text-rose-400">*</span></label>
            <input
              id="login-username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="field-input font-mono tracking-widest uppercase"
              placeholder="ABCD1234EFGH5678"
              maxLength={16}
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="field-label">Password <span className="text-rose-400">*</span></label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
                className="field-input font-mono tracking-widest uppercase pr-12"
                placeholder="••••••••••••••••"
                maxLength={16}
                autoComplete="current-password"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading || credentials.username.length < 8 || credentials.password.length < 8}
            className="btn-primary mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating…
              </>
            ) : (
              <>
                <Vote className="w-5 h-5" /> Proceed to Ballot
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Not registered yet?{' '}
          <a href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
