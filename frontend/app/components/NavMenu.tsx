'use client';

import { useState } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/register', label: 'Register' },
  { href: '/login', label: 'Vote' },
  { href: '/audit', label: 'Audit' },
  { href: '/feedback', label: 'Feedback' },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop CTA buttons */}
      <div className="hidden md:flex items-center gap-3">
        <Link
          href="/admin"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all duration-150"
        >
          Admin
        </Link>
        <Link href="/register" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          Register →
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button
        id="mobile-menu-btn"
        className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <div className="w-5 flex flex-col gap-1.5">
          <span
            className="block h-px bg-slate-400 transition-all duration-200"
            style={{ width: open ? '20px' : '20px', transform: open ? 'rotate(45deg) translateY(5px)' : 'none' }}
          />
          <span
            className="block h-px bg-slate-400 transition-all duration-200"
            style={{ width: '16px', opacity: open ? 0 : 1 }}
          />
          <span
            className="block h-px bg-slate-400 transition-all duration-200"
            style={{ width: '20px', transform: open ? 'rotate(-45deg) translateY(-5px)' : 'none' }}
          />
        </div>
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 md:hidden border-t border-white/[0.06] px-4 py-4 z-40"
          style={{ background: 'rgba(2,8,23,0.97)', backdropFilter: 'blur(16px)' }}>
          <nav className="flex flex-col gap-1">
            {[...navLinks, { href: '/admin', label: ' Admin' }].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2"
              style={{ padding: '0.625rem 1rem', fontSize: '0.875rem' }}
            >
              Register to Vote →
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
