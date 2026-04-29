'use client';

import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone?: 'cyan' | 'blue' | 'red' | 'amber' | 'emerald';
  description?: string;
}

const toneClasses = {
  cyan: 'from-cyan-500/15 via-cyan-400/8 to-transparent text-cyan-300 border-cyan-300/20',
  blue: 'from-blue-500/15 via-blue-400/8 to-transparent text-blue-300 border-blue-300/20',
  red: 'from-red-500/15 via-red-400/8 to-transparent text-rose-300 border-rose-300/20',
  amber: 'from-amber-500/15 via-amber-400/8 to-transparent text-amber-300 border-amber-300/20',
  emerald: 'from-emerald-500/15 via-emerald-400/8 to-transparent text-emerald-300 border-emerald-300/20',
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, tone = 'cyan', description }) => {
  return (
    <div className={`group rounded-[20px] border bg-gradient-to-br p-[1px] shadow-sm transition-all duration-300 hover:-translate-y-1 ${toneClasses[tone]}`}>
      <div className="surface-card h-full rounded-[19px] border border-white/10 bg-slate-950/70 p-5 text-slate-100 transition-colors duration-300 group-hover:bg-white/[0.05]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400 font-black">{label}</p>
            <div className="mt-3 text-3xl font-extrabold text-white">{value}</div>
            {description ? <p className="mt-2 text-sm text-slate-400 font-medium">{description}</p> : null}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white shadow-sm">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;