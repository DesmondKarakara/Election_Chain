'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, FileEdit, Mail, Calendar, Key, Vote, ShieldCheck, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface AuditEvent {
  id: string;
  eventType: string;
  eventHash: string;
  description?: string;
  createdAt: string;
  user?: { fullName: string; email: string };
}

const EVENT_CONFIG: Record<string, { icon: React.ReactNode, color: string, bg: string, border: string, text: string }> = {
  'REGISTRATION': { icon: <FileEdit className="w-4 h-4" />, color: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  'OTP_VERIFIED': { icon: <Mail className="w-4 h-4" />, color: 'indigo', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400' },
  'SLOT_BOOKED':  { icon: <Calendar className="w-4 h-4" />, color: 'amber', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
  'LOGIN':        { icon: <Key className="w-4 h-4" />, color: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
  'VOTE_CAST':    { icon: <Vote className="w-4 h-4" />, color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
};

const DEFAULT_CONFIG = { icon: <ClipboardList className="w-4 h-4" />, color: 'slate', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' };

const PAGE_SIZE = 50;

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => { fetchEvents(); }, [page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/audit`, {
        params: { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
      });
      setEvents(response.data.events);
      setTotal(response.data.total);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter
    ? events.filter((e) => e.eventType === filter)
    : events;

  const eventTypes = [...new Set(events.map((e) => e.eventType))];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <ClipboardList className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Public Audit Trail</h1>
            <p className="text-slate-400 text-sm">Immutable ledger of all ElectChain events</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4" /> Integrity Verified
        </div>
      </div>

      {eventTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!filter ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            All
          </button>
          {eventTypes.map((type) => {
            const config = EVENT_CONFIG[type] || DEFAULT_CONFIG;
            return (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? '' : type)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center ${
                  filter === type 
                    ? `bg-${config.color}-500 text-white shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                    : `bg-slate-800 text-slate-400 hover:bg-slate-700`
                }`}
              >
                {config.icon} <span className="ml-1.5">{type.replace(/_/g, ' ')}</span>
              </button>
            );
          })}
        </div>
      )}

      {loading && events.length === 0 ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>{filter ? `No events of type "${filter}"` : 'No events recorded yet.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((event, idx) => {
            const config = EVENT_CONFIG[event.eventType] || DEFAULT_CONFIG;
            return (
              <div
                key={event.id}
                className={`group ${config.bg} border ${config.border} rounded-xl p-4 transition-all hover:brightness-110`}
                style={{ animationDelay: `${idx * 20}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${config.bg} border ${config.border} ${config.text}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      <time className="text-[10px] font-mono text-slate-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="text-sm text-slate-300 font-medium">{event.description || 'Event logged'}</p>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${event.eventHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-600 mt-1 hover:text-blue-400 transition-colors"
                    >
                      {event.eventHash}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
