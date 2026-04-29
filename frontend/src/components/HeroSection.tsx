'use client';

import React from 'react';
import ScrollCanvas from './ScrollCanvas';

interface HeroSectionProps {
  framePaths: string[];
}

export const HeroSection: React.FC<HeroSectionProps> = ({ framePaths }) => {
  return (
    <ScrollCanvas framePaths={framePaths as any} totalFrames={framePaths.length || 150} scrollHeight="350vh">
      <div className="flex h-full items-center justify-center px-4">
        <div className="max-w-6xl text-center">
          <div className="mx-auto inline-flex rounded-full border border-cyan-400/20 bg-slate-950/75 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-300 font-black backdrop-blur-sm animate-fade-in shadow-[0_0_30px_rgba(34,211,238,0.12)]">
            AirControl Aviation Suite
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-black tracking-tight text-white md:text-7xl lg:text-9xl leading-[1.1] md:leading-[1.05] drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
            Real-time flight intelligence.
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-slate-300 md:text-xl font-semibold">
            Track fleets, monitor live radar, and analyze operational performance in a 
            production-grade cockpit built for speed and clarity.
          </p>

          <div className="mt-12 flex flex-col justify-center gap-5 sm:flex-row">
            <a 
              href="#dashboard"
              className="group relative flex items-center justify-center rounded-[18px] border border-cyan-300/30 bg-cyan-300 px-10 py-4 text-sm font-black text-slate-950 transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-200 hover:shadow-[0_20px_50px_rgba(34,211,238,0.22)] active:scale-95"
            >
              Explore Dashboard
            </a>
            <a 
              href="#tracking"
              className="group flex items-center justify-center rounded-[18px] border border-white/10 bg-white/5 px-10 py-4 text-sm font-black text-white shadow-sm transition-all duration-300 hover:border-cyan-300/30 hover:bg-white/10 active:scale-95"
            >
              Live Radar
            </a>
          </div>

          <div className="mt-20 animate-bounce text-cyan-100/90">
            <p className="text-[10px] uppercase tracking-[0.4em]">Scroll to Begin</p>
          </div>
        </div>
      </div>
    </ScrollCanvas>
  );
};

export default HeroSection;
