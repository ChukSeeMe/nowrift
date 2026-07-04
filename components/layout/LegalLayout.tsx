'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Nav } from './Nav';
import { BreakingTicker } from './BreakingTicker';
import { Footer } from './Footer';
import { 
  IconShieldLock, 
  IconScale, 
  IconCookie, 
  IconArrowLeft,
  IconClock,
  IconBuildingCommunity
} from '@tabler/icons-react';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  lastUpdated: string;
}

export default function LegalLayout({ children, title, subtitle, lastUpdated }: LegalLayoutProps) {
  const pathname = usePathname();

  const links = [
    {
      name: 'Privacy Policy',
      href: '/privacy',
      icon: IconShieldLock,
      description: 'How we collect and process data',
    },
    {
      name: 'Terms of Service',
      href: '/terms',
      icon: IconScale,
      description: 'Platform rules and intellectual property',
    },
    {
      name: 'Cookie Policy',
      href: '/cookie-policy',
      icon: IconCookie,
      description: 'Cookie details and opt-out preferences',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-near-black font-body">
      <Nav />
      <BreakingTicker />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-border/80 bg-surface/30 py-16 px-4 sm:px-6 lg:px-8">
        {/* Decorative Grid & Glows */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-rift-red/10 blur-[100px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
          >
            <IconArrowLeft size={12} />
            <span>Back to feed</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
            <div className="flex flex-col gap-2 max-w-2xl">
              <span className="text-label text-rift-red font-bold tracking-wider">NOWRIFT LEGAL CENTER</span>
              <h1 className="text-display-xl text-off-white tracking-tight leading-tight">
                {title}
              </h1>
              <p className="text-body-l text-muted font-light leading-relaxed">
                {subtitle}
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border/60 text-muted text-label select-none shrink-0 self-start md:self-auto">
              <IconClock size={12} className="text-rift-red animate-pulse" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dual-Column Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Navigation Sidebar (Left Column - 1/4) */}
          <aside className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
            <div className="flex flex-col gap-2">
              <h2 className="text-label text-muted font-bold tracking-wider mb-2">Legal Directories</h2>
              <nav className="flex flex-col gap-2">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-300 group ${
                        isActive
                          ? 'bg-surface border-border text-off-white shadow-md shadow-near-black/50'
                          : 'border-transparent text-muted hover:text-off-white hover:bg-surface/25 hover:border-border/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isActive 
                          ? 'bg-rift-red/10 text-rift-red' 
                          : 'bg-border/30 text-muted group-hover:text-off-white group-hover:bg-border/60'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-body-m font-bold leading-none">{link.name}</span>
                        <span className="text-[11px] text-muted font-light truncate leading-normal mt-1 block">
                          {link.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Corporate Info Card */}
            <div className="p-5 rounded-2xl bg-surface/40 border border-border/60 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-off-white">
                <IconBuildingCommunity size={16} className="text-rift-red" />
                <span className="text-body-m font-bold">Platform Operator</span>
              </div>
              <div className="text-body-m text-muted flex flex-col gap-1.5 font-light leading-relaxed">
                <span>CRAM Services</span>
                <span>Intellectual Systems & AI Synthesis Division</span>
                <span>legal@nowrift.com</span>
              </div>
            </div>
          </aside>

          {/* Legal Document Content (Right Column - 3/4) */}
          <article className="lg:col-span-3 prose prose-invert prose-red max-w-none text-body-l text-muted leading-relaxed font-light select-text">
            <div className="flex flex-col gap-8">
              {children}
            </div>
          </article>

        </div>
      </main>

      <Footer />
    </div>
  );
}
