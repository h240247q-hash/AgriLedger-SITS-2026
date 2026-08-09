import React from 'react';
import agriHeroBanner from '../assets/images/agri_hero_banner_1785233400055.jpg';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 text-white shadow-sm mb-6 min-h-[140px] flex items-center">
      {/* Background Hero Image with Dark Overlay */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src={agriHeroBanner}
          alt="Agricultural Supply Chain"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 px-8 py-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-[11px] font-semibold mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          System Active • Node Harare-01
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1 text-white flex items-center gap-2">
          Welcome back, Kudzai! 👋
        </h1>
        <p className="text-xs text-slate-300 font-normal">
          Real-time telemetry and ledger auditing active across all distribution points.
        </p>
      </div>

      {/* Subtle Right Glow */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
    </div>
  );
};
