import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import { Vote, BarChart2 } from 'lucide-react';
import NavMenu from './components/NavMenu';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ElectChain | Verifiable Digital Voting',
  description:
    'Privacy-preserving digital election platform with on-chain audit trail, encrypted votes, and voter-verifiable confirmations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>

        {/* ── Navigation ─────────────────────────────────────── */}
        <header
          className="sticky top-0 z-50 border-b border-white/[0.06] relative"
          style={{ background: 'rgba(2,8,23,0.90)', backdropFilter: 'blur(16px)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Vote className="w-6 h-6 text-blue-400" />
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ElectChain
              </span>
            </Link>

            {/* Nav + mobile toggle (client component) */}
            <NavMenu />
          </div>
        </header>

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
          {children}
        </main>

        {/* ── Footer ─────────────────────────────────────────── */}
        <footer className="border-t border-white/[0.06] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-400">ElectChain</span>
                <span className="badge badge-blue">MVP</span>
              </div>
              <p className="text-xs text-slate-600 text-center">
                Privacy-preserving voting · On-chain audit trail · Not for production use
              </p>
              <div className="flex items-center gap-4">
                <Link href="/audit"    className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Audit Trail</Link>
                <Link href="/feedback" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Feedback</Link>
              </div>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
