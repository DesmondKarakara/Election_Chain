import Link from 'next/link';
import { Shield, CheckCircle, Link as LinkIcon, Clock, Key, User, FileEdit, Mail, Calendar, Vote, Check, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: <Shield className="w-8 h-8 text-blue-400" />,
    title: 'End-to-End Encrypted',
    desc: 'Votes are encrypted client-side with AES-256 before submission. Your choice never travels in plain text.',
    color: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/20',
    glow: 'rgba(59,130,246,0.4)',
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
    title: 'Voter-Verifiable',
    desc: 'Receive a unique verification ID to confirm your vote was recorded — without revealing your choice.',
    color: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    glow: 'rgba(16,185,129,0.4)',
  },
  {
    icon: <LinkIcon className="w-8 h-8 text-purple-400" />,
    title: 'On-Chain Audit Trail',
    desc: 'Every election event is written to an immutable blockchain ledger for independent verification.',
    color: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-500/20',
    glow: 'rgba(139,92,246,0.4)',
  },
  {
    icon: <Clock className="w-8 h-8 text-amber-400" />,
    title: 'Time-Slot Voting',
    desc: 'Voters are assigned a 30-minute window, reducing congestion and ensuring orderly participation.',
    color: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    glow: 'rgba(245,158,11,0.4)',
  },
  {
    icon: <Key className="w-8 h-8 text-cyan-400" />,
    title: 'One-Time Credentials',
    desc: 'Single-use login credentials are generated per voter and expire after use — impossible to replay.',
    color: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/20',
    glow: 'rgba(6,182,212,0.4)',
  },
  {
    icon: <User className="w-8 h-8 text-rose-400" />,
    title: 'Identity Separation',
    desc: 'Your identity is never linked to your vote choice on-chain. Only hashed commitments are recorded.',
    color: 'from-rose-500/20 to-pink-500/20',
    border: 'border-rose-500/20',
    glow: 'rgba(244,63,94,0.4)',
  },
];

const steps = [
  { n: '01', title: 'Register',      desc: 'Create your voter account with email & wallet address.',    icon: <FileEdit className="w-5 h-5 text-blue-400" /> },
  { n: '02', title: 'Verify Email',  desc: 'Confirm your identity via a one-time OTP sent to email.',   icon: <Mail className="w-5 h-5 text-blue-400" /> },
  { n: '03', title: 'Book a Slot',   desc: 'Select your preferred 30-minute voting time window.',        icon: <Calendar className="w-5 h-5 text-blue-400" /> },
  { n: '04', title: 'Login to Vote', desc: 'Use your one-time credentials received by email.',           icon: <Key className="w-5 h-5 text-blue-400" /> },
  { n: '05', title: 'Cast Your Vote', desc: 'Select a candidate — your vote is encrypted client-side.',  icon: <Vote className="w-5 h-5 text-blue-400" /> },
  { n: '06', title: 'Get Confirmed', desc: 'Receive a voter-verifiable confirmation slip with your ID.', icon: <Check className="w-5 h-5 text-blue-400" /> },
];

export default function Home() {
  return (
    <div className="space-y-24">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 text-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/8 mb-6 animate-fade-in">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-blue-300 tracking-widest uppercase">Testnet Active</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black mb-6 tracking-tight animate-slide-up">
            <span className="text-gradient">ElectChain</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-4 animate-slide-up-1">
            Privacy-preserving digital voting with on-chain transparency.
            <br className="hidden sm:block" /> Secure. Verifiable. Open.
          </p>

          <p className="text-sm text-slate-600 mb-10 animate-slide-up-2">
            End-to-end encrypted · One-time credentials · Blockchain audit trail
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-3">
            <Link
              href="/register"
              id="hero-register-btn"
              className="btn-primary !w-auto !px-8 !py-3.5 !text-base rounded-xl"
            >
              <FileEdit className="w-5 h-5 mr-1" /> Register to Vote
            </Link>
            <Link
              href="/login"
              id="hero-vote-btn"
              className="btn-secondary !px-8 !py-3.5 !text-base rounded-xl"
            >
              <Vote className="w-5 h-5 mr-1" /> Cast Your Vote
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────── */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-2xl font-bold text-center mb-2 animate-fade-in">
          Built for Security & Transparency
        </h2>
        <p className="text-slate-500 text-center mb-10 text-sm animate-fade-in">
          Every component of the platform is designed around voter privacy and election integrity.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card p-6 bg-gradient-to-br ${f.color} border ${f.border} group cursor-default`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-3 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-slate-500 text-center mb-10 text-sm">
          Six simple steps from registration to confirmed vote.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s, i) => (
            <div key={s.n} className="glass-card p-5 flex gap-4 items-start group hover:border-blue-500/25 transition-all duration-200">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200">
                  {s.icon}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-blue-500/70 tracking-widest mb-0.5">STEP {s.n}</div>
                <h3 className="font-bold text-white text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="glass-card gradient-border p-10 text-center animate-pulse-glow">
        <h2 className="text-3xl font-black mb-3">Ready to participate?</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Join the testnet election and experience privacy-preserving voting firsthand.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" id="cta-register-btn" className="btn-primary !w-auto !px-10 !py-3.5">
            <FileEdit className="w-5 h-5 mr-1" /> Register Now
          </Link>
          <Link href="/admin" id="cta-admin-btn" className="btn-secondary !px-10 !py-3.5">
            <BarChart2 className="w-5 h-5 mr-1" /> Admin Dashboard
          </Link>
        </div>
      </section>

    </div>
  );
}
