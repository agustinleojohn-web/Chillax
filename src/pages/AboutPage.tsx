import React from 'react';
import { Clapperboard, ShieldCheck, Film, Compass, Zap } from 'lucide-react';
import { APP_NAME } from '../lib/constants';
import { useSeo } from '../lib/seo';

export function AboutPage() {
  useSeo({
    title: 'About Chillax',
    description: 'Learn about Chillax, the cinematic movie discovery portal and torrent metadata index.',
  });

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16">
      <div className="space-y-3 border-b border-[#262626] pb-6">
        <div className="w-10 h-10 rounded-lg bg-[#E50914] flex items-center justify-center text-white">
          <Clapperboard className="w-5 h-5 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          About {APP_NAME}
        </h1>
        <p className="text-sm text-[#AAAAAA] leading-relaxed">
          Chillax was engineered as a high-performance, dark-first cinematic catalog and movie discovery engine inspired by leading streaming experiences. Built for cinema lovers who appreciate rich billboard backdrops, responsive poster grids, and direct access to technical encoding specifications.
        </p>
      </div>

      <div className="space-y-6 text-sm text-[#AAAAAA] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#E50914]" />
            Discovery Over Noise
          </h2>
          <p>
            Chillax provides an unfiltered, searchable index of cinema. Filter through thousands of records by release year, precise IMDb user score, genre, and technical quality.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-[#E50914]" />
            Cinema Metadata Integrity
          </h2>
          <p>
            Every title in our catalog is linked to authentic records containing verified runtime figures, high-resolution original posters, synopsis narratives, full cast credits, and official trailer previews.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#E50914]" />
            Torrent Architecture &amp; Public Domain Distribution
          </h2>
          <p>
            Chillax implements standardized BitTorrent magnet URI construction adhering to RFC BTIH specifications. Magnet links are constructed dynamically on your client from verified torrent hashes and routed to tier-1 high-availability trackers.
          </p>
        </section>

        <section className="space-y-2 p-5 rounded-lg bg-[#181818] border border-[#2F2F2F]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
            Legal &amp; Content Disclaimer
          </h3>
          <p className="text-xs text-[#888888] leading-relaxed">
            Chillax does not host video files, stream media, or manage private torrent trackers. Magnet URIs and download parameters are provided strictly for public domain, copyleft, and authorized educational distributions. Users must ensure compliance with their local copyright regulations when interacting with peer-to-peer protocols.
          </p>
        </section>
      </div>
    </div>
  );
}
