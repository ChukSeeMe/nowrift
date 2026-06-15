import React from 'react';
import Link from 'next/link';
import { IconArrowLeft, IconCircleCheck, IconMail, IconArrowRight } from '@tabler/icons-react';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import NewsletterForm from '@/components/newsletter/NewsletterForm';

export default async function NewsletterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-8">
        
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-label text-muted hover:text-off-white transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>

        {/* Dual column landing page grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mt-4">
          
          {/* Landing features copy */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-label text-rift-red font-bold tracking-wider">NOWRIFT NEWSLETTER</span>
              <h1 className="text-display-xl text-off-white leading-tight">
                Stay Ahead of the Rift
              </h1>
            </div>
            
            <p className="text-body-l text-muted leading-relaxed font-light">
              Join founders, developers, and security professionals receiving daily AI-synthesized intelligence.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-rift-red/10 text-rift-red flex items-center justify-center shrink-0 mt-0.5">
                  <IconCircleCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-m font-bold text-off-white">Daily AI Synthesis</span>
                  <span className="text-body-m text-muted">Daily reports summarizing critical industry milestones.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-dev-blue/10 text-dev-blue flex items-center justify-center shrink-0 mt-0.5">
                  <IconCircleCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-m font-bold text-off-white">Compliance Auditing</span>
                  <span className="text-body-m text-muted">Source similarity percentages and verification records.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-grant-green/10 text-grant-green flex items-center justify-center shrink-0 mt-0.5">
                  <IconCircleCheck size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-body-m font-bold text-off-white">Curated Grant Alerts</span>
                  <span className="text-body-m text-muted">Immediate matching alerts for new funding opportunities.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="lg:pl-6">
            <NewsletterForm />
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
