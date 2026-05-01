'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart2, RefreshCw, Users, Mail, Vote, Calendar, ClipboardList, MessageSquare, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Summary {
  totalRegistered: number;
  totalVerified: number;
  totalVoted: number;
  totalSlots: number;
  totalAuditEvents: number;
  totalFeedback: number;
  voteCounts: Array<{ candidateSymbol: string; _count: number }>;
  metrics: {
    dau: number;
    transactionsToday: number;
    retentionRate: string;
  };
}

const StatCard = ({
  title, value, icon, color, sub,
}: { title: string; value: number | string; icon: React.ReactNode; color: string; sub?: string }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`glass-card p-6 border ${colorMap[color] || 'border-slate-800'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color] || 'bg-slate-800'}`}>
          {icon}
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live</span>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
};

export default function AdminPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/summary`);
      setSummary(response.data.summary);
      setLastUpdated(new Date());
    } catch {
      // fail silently on refresh
    } finally {
      setLoading(false);
    }
  };

  const downloadFeedback = async () => {
    setExporting(true);
    try {
      const response = await axios.get(`${API_BASE}/admin/feedback`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `electchain-feedback-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download feedback.');
    } finally {
      setExporting(false);
    }
  };

  const pct = (part: number, total: number) =>
    total > 0 ? ((part / total) * 100).toFixed(1) : '0';

  const maxVotes = summary ? Math.max(...summary.voteCounts.map((v) => v._count), 1) : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-1 flex items-center gap-3">
            <BarChart2 className="w-8 h-8 text-indigo-500" /> Metrics & Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time ElectChain activity overview
            {lastUpdated && (
              <span className="ml-2 text-slate-600">
                · Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="btn-secondary !w-auto !px-4 !py-2 flex items-center gap-2"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {summary && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <StatCard icon={<Users size={20} />} title="Registered Voters" value={summary.totalRegistered} color="blue" />
            <StatCard icon={<Mail size={20} />} title="Email Verified" value={summary.totalVerified} sub={`${pct(summary.totalVerified, summary.totalRegistered)}% of registered`} color="emerald" />
            <StatCard icon={<Vote size={20} />} title="Votes Cast" value={summary.totalVoted} sub={`${pct(summary.totalVoted, summary.totalVerified)}% turnout`} color="indigo" />
            
            {/* Advanced Metrics */}
            <StatCard icon={<Users size={20} />} title="DAU (Active Users Today)" value={summary.metrics.dau} color="cyan" />
            <StatCard icon={<ClipboardList size={20} />} title="Stellar Txs Today" value={summary.metrics.transactionsToday} color="purple" sub="On-chain audit logs" />
            <StatCard icon={<RefreshCw size={20} />} title="Voter Retention" value={summary.metrics.retentionRate} color="emerald" sub="Registration to Vote conversion" />
            
            <StatCard icon={<Calendar size={20} />} title="Voting Slots" value={summary.totalSlots} color="amber" />
            <StatCard icon={<ClipboardList size={20} />} title="Total Audit Events" value={summary.totalAuditEvents} color="purple" />
            <StatCard icon={<MessageSquare size={20} />} title="Feedback Submissions" value={summary.totalFeedback} color="cyan" />
          </div>

          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> Participation Funnel
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Registered', value: summary.totalRegistered, max: summary.totalRegistered, color: '#3b82f6' },
                { label: 'Email Verified', value: summary.totalVerified, max: summary.totalRegistered, color: '#10b981' },
                { label: 'Voted', value: summary.totalVoted, max: summary.totalRegistered, color: '#6366f1' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{row.label}</span>
                    <span className="font-mono">{row.value} ({pct(row.value, row.max)}%)</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(row.value, row.max)}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <Vote className="w-5 h-5" /> Vote Count by Candidate
            </h2>
            {summary.voteCounts.length === 0 ? (
              <div className="py-10 text-center text-slate-500">No votes recorded yet</div>
            ) : (
              <div className="space-y-4">
                {[...summary.voteCounts]
                  .sort((a, b) => b._count - a._count)
                  .map((vote, idx) => (
                    <div key={vote.candidateSymbol} className="flex items-center gap-4">
                      <span className="text-3xl w-10 text-center flex-shrink-0">{vote.candidateSymbol}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Candidate {idx + 1}</span>
                          <span className="font-mono font-bold text-white">{vote._count} votes</span>
                        </div>
                        <div className="h-4 rounded-full bg-white/[0.05] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${(vote._count / maxVotes) * 100}%`,
                              background: 'linear-gradient(90deg, #2563eb, #4f46e5)',
                              boxShadow: '0 0 10px rgba(59,130,246,0.4)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/audit"
              id="view-audit-btn"
              className="btn-secondary flex-1 !justify-center !py-3.5"
              style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#c4b5fd' }}
            >
              <ClipboardList className="w-5 h-5 mr-2" /> View Full Audit Trail
            </Link>
            <button
              id="download-feedback-btn"
              onClick={downloadFeedback}
              className="btn-secondary flex-1 !justify-center !py-3.5"
              style={{ borderColor: 'rgba(16,185,129,0.3)', color: '#6ee7b7' }}
            >
              {exporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              Export Feedback CSV
            </button>
          </div>
        </>
      )}

      {!summary && !loading && (
        <div className="glass-card p-10 text-center text-slate-500">
          <BarChart2 className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p>Failed to load dashboard. Check your backend connection.</p>
          <button onClick={fetchSummary} className="btn-primary !w-auto !px-6 !py-2 mt-4 mx-auto">Retry</button>
        </div>
      )}
    </div>
  );
}
