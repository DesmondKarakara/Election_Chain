'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PartyPopper, CheckCircle2, Printer, MessageSquare, Home } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

export default function ConfirmationPage() {
  const [confirmation, setConfirmation] = useState<any>(null);
  const [user, setUser]                 = useState<any>(null);
  const [revealed, setRevealed]         = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('voteConfirmation');
    const storedUser = localStorage.getItem('user');
    if (stored)     setConfirmation(JSON.parse(stored));
    if (storedUser) setUser(JSON.parse(storedUser));

    // Reveal animation with slight delay
    const revealTimer = setTimeout(() => setRevealed(true), 300);

    // Clear sensitive data after 10 min
    const clearTimer = setTimeout(() => {
      localStorage.removeItem('votingToken');
      localStorage.removeItem('voteConfirmation');
    }, 10 * 60 * 1000);

    return () => { clearTimeout(revealTimer); clearTimeout(clearTimer); };
  }, []);

  if (!confirmation) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="glass-card p-10 animate-pulse">
          <p className="text-slate-500">Loading confirmation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <FlowStepper currentStep={6} />

      {/* Success header */}
      <div className="text-center mb-10">
        <div className={`flex justify-center mb-6 transition-all duration-700 ${revealed ? 'animate-float opacity-100' : 'opacity-0 scale-50'}`}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-emerald-400" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-3">Vote Recorded</h1>
        <p className="text-slate-400 text-lg">
          Your encrypted vote has been securely added to the ledger and an email sent to{' '}
          <span className="text-blue-400">{user?.email || 'your address'}</span>.
        </p>
      </div>

      {/* VVPAT Slip */}
      <div
        id="vvpat-slip"
        className={`glass-card gradient-border p-8 mb-6 transition-all duration-700 print:shadow-none print:border-slate-800 ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Slip header */}
        <div className="text-center mb-6 pb-6 border-b border-white/[0.08]">
          <p className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-1">ElectChain</p>
          <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
            Voter-Verifiable Confirmation Slip
          </p>
        </div>

        <div className="space-y-6">
          {/* Verification ID */}
          <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">Verification ID</p>
            <p
              className={`text-3xl font-mono font-black text-blue-300 tracking-[0.15em] transition-all duration-500 ${
                revealed ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {confirmation.verificationId}
            </p>
            <p className="text-xs text-slate-600 mt-2">Keep this ID. It proves your vote was counted without revealing your choice.</p>
          </div>

          {/* Vote symbol */}
          <div className="text-center py-4">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">Your Vote</p>
            <div
              className={`text-8xl transition-all duration-700 delay-300 ${
                revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}
            >
              {confirmation.candidateSymbol}
            </div>
          </div>

          {/* Timestamp */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">Time Recorded</p>
            <p className="text-sm font-mono text-slate-300">
              {new Date(confirmation.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/[0.08] text-center space-y-1">
          <p className="text-xs text-slate-600">Your identity is separated from your vote choice on-chain.</p>
          <p className="text-xs text-slate-600">Only the symbol above is linked to your verification ID.</p>
        </div>
      </div>

      {/* Next steps */}
      <div className="glass-card p-8 mb-10 border border-emerald-500/20 bg-emerald-500/5 text-center">
        <h3 className="font-bold text-white mb-6">What's Next?</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Wait for election results
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Verify on audit trail
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="btn-secondary !w-auto flex items-center"
        >
          <Printer className="w-4 h-4 mr-2" /> Print Slip
        </button>
        <Link href="/feedback" className="btn-primary !w-auto flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" /> Give Feedback
        </Link>
        <Link href="/" className="btn-secondary !w-auto flex items-center">
          <Home className="w-4 h-4 mr-2" /> Return Home
        </Link>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          nav, footer, #__next > header { display: none !important; }
          #vvpat-slip { color: black !important; border: 2px solid #000 !important; background: white !important; }
        }
      `}</style>
    </div>
  );
}
