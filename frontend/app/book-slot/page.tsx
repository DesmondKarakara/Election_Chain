'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import FlowStepper from '../components/FlowStepper';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Slot {
  id: string;
  slotTime: string;
  availableCapacity: number;
  isFull: boolean;
}

function BookSlotContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const [slots, setSlots]             = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState('');
  const [error, setError]             = useState('');

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/slots`);
      setSlots(response.data.slots);
    } catch {
      setError('Failed to load available slots. Please refresh.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) { setError('Please select a time slot.'); return; }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/book-slot`, { email, slotId: selectedSlot });
      setMessage('Voting slot confirmed! Please check your email for voting credentials.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book slot.');
    } finally {
      setLoading(false);
    }
  };

  const formatSlot = (slotTime: string) => {
    const d = new Date(slotTime);
    return {
      date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <FlowStepper currentStep={3} />

      <div className="glass-card gradient-border p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black mb-1">Book Voting Slot</h1>
          <p className="text-slate-500 text-sm">Select a 30-minute window to cast your vote</p>
        </div>

        {/* Alerts */}
        {message && (
          <div className="alert-success mb-6 animate-scale-in" role="alert">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message} Redirecting to login…</span>
          </div>
        )}
        {error && (
          <div className="alert-error mb-6 animate-scale-in" role="alert">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <fieldset>
            <legend className="field-label mb-3">Available Time Slots</legend>

            {slotsLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No slots available at this time.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {slots.map((slot) => {
                  const { date, time } = formatSlot(slot.slotTime);
                  const isSelected = selectedSlot === slot.id;
                  return (
                    <label
                      key={slot.id}
                      className={[
                        'flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-150',
                        slot.isFull
                          ? 'opacity-40 cursor-not-allowed border-white/[0.06] bg-transparent'
                          : isSelected
                          ? 'border-blue-500/50 bg-blue-500/10 shadow-glow-sm'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="slot"
                        value={slot.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                        disabled={slot.isFull}
                        className="sr-only"
                        id={`slot-${slot.id}`}
                      />
                      {/* Custom radio circle */}
                      <div className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-600',
                      ].join(' ')}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm">{date}</p>
                        <p className="text-slate-400 text-xs">{time} – 30 min window</p>
                      </div>

                      {slot.isFull ? (
                        <span className="badge badge-amber flex-shrink-0">FULL</span>
                      ) : (
                        <span className="badge badge-green flex-shrink-0">{slot.availableCapacity} left</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </fieldset>

          <button
            id="book-slot-btn"
            type="submit"
            disabled={loading || !selectedSlot || slotsLoading}
            className="btn-primary mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirming Slot…
              </>
            ) : 'Confirm Slot Selection →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function BookSlotPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 animate-pulse h-80" />
      </div>
    }>
      <BookSlotContent />
    </Suspense>
  );
}
