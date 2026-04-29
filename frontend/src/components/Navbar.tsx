'use client';

import React from 'react';
import Link from 'next/link';
import { Plane } from 'lucide-react';
import clsx from 'clsx';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={clsx(
        'navbar-glass transition-all duration-500 ease-in-out px-4 md:px-8',
        scrolled ? 'py-3 bg-slate-950/90 border-white/10 shadow-xl' : 'py-6 bg-slate-950/30 border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)] transition-transform group-hover:scale-110">
              <Plane className="w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-white">
              AirControl
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {[
              { name: 'Dashboard', href: '#dashboard' },
              { name: 'Tracking', href: '#tracking' },
              { name: 'Analytics', href: '#analytics' },
            ].map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300 transition-all hover:text-cyan-300 hover:tracking-[0.25em]"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <a 
            href="#tracking"
            className="hidden sm:block px-8 py-3 rounded-full border border-cyan-300/30 bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-widest transition-all hover:bg-cyan-200 hover:shadow-[0_10px_30px_rgba(34,211,238,0.2)] active:scale-95"
          >
            Go Live
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
