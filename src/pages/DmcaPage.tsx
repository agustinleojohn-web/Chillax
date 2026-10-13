import React from 'react';
import { ShieldAlert, Mail } from 'lucide-react';
import { APP_NAME } from '../lib/constants';
import { useSeo } from '../lib/seo';

export function DmcaPage() {
  useSeo({
    title: 'DMCA Copyright Compliance Policy',
    description: 'Digital Millennium Copyright Act (DMCA) notice and takedown guidelines for Chillax.',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="space-y-2 border-b border-[#262626] pb-6">
        <div className="flex items-center gap-2 text-[#E50914]">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Copyright Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white font-bebas">
          DMCA Policy &amp; Copyright Compliance
        </h1>
        <p className="text-xs text-[#888888]">Last Updated: October 2026</p>
      </div>

      <div className="space-y-6 text-sm text-[#AAAAAA] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Service Nature &amp; Information Indexing</h2>
          <p>
            {APP_NAME} operates strictly as an automated catalog search index and discovery interface. {APP_NAME} does not host, stream, reproduce, or upload any video, audio, media files, or copyrighted materials on its servers.
          </p>
          <p>
            All movie metadata, poster artworks, descriptions, and user ratings displayed on this platform are retrieved from publicly accessible third-party APIs. Magnet URIs and hash metadata are provided strictly for public-domain, open-source, and authorized educational distributions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. DMCA Takedown Notice Requirements</h2>
          <p>
            {APP_NAME} complies with the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe in good faith that any content or metadata indexed on this site infringes upon your copyrighted intellectual property, please submit a written notification containing:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-[#CCCCCC]">
            <li>A physical or electronic signature of the copyright owner or person authorized to act on their behalf.</li>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the specific material (URL or page) requested to be delisted from the index.</li>
            <li>Your contact information, including name, address, telephone number, and valid email address.</li>
            <li>A statement that you have a good-faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement made under penalty of perjury that the information in the notification is accurate.</li>
          </ul>
        </section>

        <section className="space-y-3 p-5 rounded-lg bg-[#181818] border border-[#2F2F2F]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#E50914]" />
            Designated DMCA Agent Contact
          </h3>
          <p className="text-xs text-[#888888] leading-relaxed">
            Please direct all verified DMCA notices to our designated compliance department:
          </p>
          <div className="text-xs font-mono text-white bg-[#202020] p-3 rounded border border-[#333333]">
            dmca-compliance@chillax-movies.org
          </div>
          <p className="text-[11px] text-[#777777]">
            Valid notices are processed promptly within 24–48 business hours, and eligible index links will be removed in accordance with 17 U.S.C. § 512(c).
          </p>
        </section>
      </div>
    </div>
  );
}
