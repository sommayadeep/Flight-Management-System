'use client';

import React from 'react';

export const TransitionSection: React.FC = () => {
  return (
    <section className="relative z-10 flex min-h-screen w-full items-center overflow-hidden bg-slate-950 px-4 py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.06),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.05),transparent_26%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_90px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-300 font-black">
                Transition Bridge
              </div>
              <h2 className="mt-5 text-4xl font-extrabold text-white md:text-5xl">
                The cockpit fades into the control floor.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg font-medium">
                This bridge section absorbs the end of the cinematic scroll and hands the user
                directly into the operational tools below. The page remains one continuous story,
                with no hard visual break between the takeoff sequence and the dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 01</div>
                <div className="mt-3 text-xl font-bold">Frame Motion</div>
                <p className="mt-2 text-sm text-slate-400 font-medium">Full-screen canvas tied to scroll.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 02</div>
                <div className="mt-3 text-xl font-bold">UI Fade</div>
                <p className="mt-2 text-sm text-slate-400 font-medium">Overlay softness as content arrives.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Phase 03</div>
                <div className="mt-3 text-xl font-bold">Next Sections</div>
                <p className="mt-2 text-sm text-slate-400 font-medium">Operational tools flow in.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransitionSection;