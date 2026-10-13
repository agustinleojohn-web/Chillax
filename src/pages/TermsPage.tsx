import React from 'react';
import { FileText } from 'lucide-react';
import { useSeo } from '../lib/seo';

export function TermsPage() {
  useSeo({
    title: 'Terms of Service',
    description: 'Terms of Service and acceptable use conditions for Chillax.',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2 border-b border-[#1E1E1E] pb-6">
        <div className="flex items-center gap-2 text-[#E50914]">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Acceptable Use</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5]">Terms of Service</h1>
        <p className="text-xs text-[#737373]">Effective Date: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-[#A3A3A3] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">1. Informational Catalog Purpose</h2>
          <p>
            Chillax is an index and discovery platform that provides informational summaries, user reviews, cast directories, and technical torrent metadata. Chillax does not host copyrighted media files or stream copyrighted audiovisual material.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">2. User Responsibilities & Copyright Compliance</h2>
          <p>
            Users are solely responsible for ensuring that any torrents, media files, or magnet URIs accessed through their external BitTorrent client conform to applicable copyright laws in their jurisdiction. The inclusion of metadata does not constitute authorization or endorsement of copyright infringement.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#F5F5F5]">3. Disclaimer of Warranties</h2>
          <p>
            The service and metadata are provided &quot;as is&quot; without warranty of any kind. Chillax cannot guarantee the availability, swarm health, accuracy, or safety of third-party decentralized peer-to-peer swarms.
          </p>
        </section>
      </div>
    </div>
  );
}
