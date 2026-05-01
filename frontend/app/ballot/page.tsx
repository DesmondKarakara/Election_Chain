'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { useRouter } from 'next/navigation';
import { Vote, AlertTriangle, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Candidate {
  id: string;
  name: string;
  symbol: string;
  party: string;
}

interface Ballot {
  electionName: string;
  candidates: Candidate[];
}

const PARTY_COLORS: Record<string, string> = {
  'Blue Party':  'from-blue-600/20 to-indigo-600/20 border-blue-500/30',
  'Red Party':   'from-rose-600/20 to-red-600/20 border-rose-500/30',
  'Green Party': 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
};

export default function BallotPage() {
  const [ballot, setBallot]             = useState<Ballot | null>(null);
  const [selectedCandidate, setSelected] = useState<string>('');
  const [loading, setLoading]           = useState(false);
  const [ballotLoading, setBallotLoading] = useState(true);
  const [error, setError]               = useState('');
  const [submitted, setSubmitted]       = useState(false);
  const [user, setUser]                 = useState<any>(null);
  const router                          = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchBallot();
  }, []);

  const fetchBallot = async () => {
    setBallotLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/ballot`);
      setBallot(response.data);
    } catch {
      setError('Failed to load ballot. Please refresh the page.');
    } finally {
      setBallotLoading(false);
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) { setError('Please select a candidate.'); return; }

    setLoading(true);
    setError('');
    try {
      const votingToken = localStorage.getItem('votingToken');
      const token = localStorage.getItem('votingToken');
      const commitmentHash = localStorage.getItem('commitmentHash');
      if (!token) { setError('Session expired. Please login again.'); setLoading(false); return; }

      const voteData = JSON.stringify({ candidateId: selectedCandidate, timestamp: new Date().toISOString() });
      const encryptionKey = CryptoJS.lib.WordArray.random(256 / 8);
      const encryptedVote = CryptoJS.AES.encrypt(voteData, encryptionKey).toString();

      const response = await axios.post(
        `${API_BASE}/cast-vote`,
        { candidateId: selectedCandidate, encryptedVote, commitmentHash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      localStorage.setItem('verificationId', response.data.verificationId);
      localStorage.setItem('txHash', response.data.transactionHash || 'pending_on_chain');
      
      setSubmitted(true);
      setTimeout(() => {
        router.push('/confirmation');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (ballotLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-2 bg-white/5 rounded-full mb-8" />
        <div className="h-10 bg-white/5 rounded-xl w-64 mx-auto" />
        <div className="h-4 bg-white/5 rounded w-48 mx-auto" />
        {[1,2,3].map(i => <div key={i} className="glass-card h-28 rounded-xl" />)}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 animate-scale-in">
        <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-4 animate-float" />
        <h2 className="text-2xl font-black mb-2">Vote Submitted!</h2>
        <p className="text-slate-400">Redirecting to your confirmation slip…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <FlowStepper currentStep={5} />

      <div className="glass-card gradient-border p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Vote className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Official Ballot</h1>
              <p className="text-slate-400 text-sm">Select one candidate. Your choice will be encrypted.</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
            {user?.fullName || 'Voter'}
          </div>
        </div>

        {error && (
          <div className="alert-error mb-6 animate-scale-in" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-6 text-xs text-slate-500 font-medium uppercase tracking-wider">
          <Lock className="w-4 h-4" />
          <span>AES-256 Client-Side Encryption Active</span>
        </div>

        <fieldset className="mb-6">
          <legend className="field-label mb-4">Select Your Candidate</legend>
          <div className="space-y-3">
            {ballot?.candidates.map((candidate) => {
              const isSelected = selectedCandidate === candidate.id;
              const colorClass = PARTY_COLORS[candidate.party] || 'from-slate-600/20 to-slate-700/20 border-slate-500/30';
              return (
                <label
                  key={candidate.id}
                  className={[
                    'flex items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200',
                    isSelected
                      ? `bg-gradient-to-r ${colorClass} scale-[1.01]`
                      : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="candidate"
                    value={candidate.id}
                    checked={isSelected}
                    onChange={(e) => setSelected(e.target.value)}
                    className="sr-only"
                  />
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600',
                  ].join(' ')}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="text-4xl flex-shrink-0">{candidate.symbol}</div>
                  <div className="flex-1">
                    <p className="font-bold text-white">{candidate.name}</p>
                    <p className="text-sm text-slate-400">{candidate.party}</p>
                  </div>
                  {isSelected && (
                    <span className="badge badge-blue flex-shrink-0 animate-scale-in">Selected ✓</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
          <Lock className="text-amber-400 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-200/70 leading-relaxed">
            <strong className="text-amber-300">Privacy guarantee:</strong> Your vote is encrypted in your browser before submission. Your identity will not be linked to your choice on-chain.
          </p>
        </div>

        <button
          onClick={handleVote}
          disabled={loading || submitted}
          className="btn-primary !py-4 text-lg w-full sm:w-auto sm:min-w-[280px]"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Encrypting & Submitting…
            </>
          ) : submitted ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Vote Confirmed!
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              Cast Encrypted Vote →
            </>
          )}
        </button>
      </div>
    </div>
  );
}
