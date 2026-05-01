'use client';

import React from 'react';
import { FileEdit, Mail, Calendar, Key, Vote, CheckCircle2 } from 'lucide-react';

interface Step {
  number: number;
  label: string;
  icon: React.ElementType;
}

const STEPS: Step[] = [
  { number: 1, label: 'Register',   icon: FileEdit },
  { number: 2, label: 'Verify OTP', icon: Mail },
  { number: 3, label: 'Book Slot',  icon: Calendar },
  { number: 4, label: 'Login',      icon: Key },
  { number: 5, label: 'Vote',       icon: Vote },
  { number: 6, label: 'Confirm',    icon: CheckCircle2 },
];

interface FlowStepperProps {
  currentStep: number; // 1–6
}

export default function FlowStepper({ currentStep }: FlowStepperProps) {
  return (
    <nav aria-label="Voting process steps" className="mb-8">
      <ol className="flex items-center justify-between gap-1">
        {STEPS.map((step, idx) => {
          const isDone    = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <li key={step.number} className="flex items-center flex-1">
              {/* Step bubble */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm z-10 transition-all duration-300 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border-2 border-blue-400'
                      : isDone
                      ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-700'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {React.createElement(step.icon, { className: 'w-4 h-4' })}
                </div>
                <span
                  className={[
                    'text-[10px] font-semibold hidden sm:block text-center leading-none tracking-wide',
                    isDone    ? 'text-emerald-400' :
                    isCurrent ? 'text-blue-400'    : 'text-slate-600',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-1">
                  <div
                    className={[
                      'h-px transition-all duration-500',
                      isDone
                        ? 'bg-gradient-to-r from-emerald-500 to-blue-500'
                        : 'bg-white/10',
                    ].join(' ')}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
