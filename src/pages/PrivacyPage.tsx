import React from 'react';
import { Shield } from 'lucide-react';
import { useSeo } from '../lib/seo';

export function PrivacyPage() {
  useSeo({
    title: 'Privacy Policy',
    description: 'Privacy Policy and data practices for Chillax users.',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2 border-b border-[#1E1E1E] pb-6">
        <div className="flex items-center gap-2 text-[#E50914]">
          <Shield className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Legal Document</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5]">Privacy Policy</h1>
        <p className="text-xs text-[#737373]">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-[#A3A3A3] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">1. Zero Account / Local-First Privacy</h2>
          <p>
            Chillax does not require account creation, email registration, passwords, or personal identity disclosure. We do not maintain user profile databases or link your activity to external identifiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">2. Client-Side Browser Storage</h2>
          <p>
            Your personal watchlist is stored exclusively within your local browser storage (<code className="font-mono text-xs text-[#F5F5F5]">localStorage</code>). This information never leaves your device and is not transmitted to our servers or third-party analytics trackers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">3. Public API Queries</h2>
          <p>
            When browsing, searching, or loading movie specifications, your browser requests public JSON metadata from the cinema API endpoint. These requests transmit standard HTTP request headers necessary for web communication.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">4. External Magnet Protocol Actions</h2>
          <p>
            When you select &quot;Open in Client&quot;, your browser delegates the magnet URI to your locally installed operating system BitTorrent application. Chillax does not track, log, or monitor peer handshakes conducted by your external software.
          </p>
        </section>
      </div>
    </div>
  );
}
