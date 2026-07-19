import React from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { SOCIAL_LINKS, getSocialIcon } from './SocialLinks';

export function Footer() {
  return (
    <footer className="w-full bg-near-black border-t border-border/80 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Logo size="sm" />
          <p className="text-body-m text-muted max-w-xs leading-relaxed">
            The dark-mode-first AI and tech news engine delivering synthesized industry insights.
          </p>
          <div className="flex items-center gap-4 mt-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-rift-red transition-colors"
                title={link.name}
              >
                {getSocialIcon(link.icon)}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-label text-off-white font-bold tracking-wider">Verticals</span>
          <nav className="flex flex-col gap-2 text-body-m text-muted">
            <Link href="/channels/ai-models" className="hover:text-rift-red transition-colors">AI Models</Link>
            <Link href="/channels/developers" className="hover:text-rift-red transition-colors">Developers</Link>
            <Link href="/channels/cybersecurity" className="hover:text-rift-red transition-colors">Cybersecurity</Link>
            <Link href="/channels/hardware" className="hover:text-rift-red transition-colors">Hardware</Link>
            <Link href="/channels/founders" className="hover:text-rift-red transition-colors">Founders</Link>
            <Link href="/channels/creators" className="hover:text-rift-red transition-colors">Creators</Link>
            <Link href="/channels/data-science" className="hover:text-rift-red transition-colors">Data Science</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-label text-off-white font-bold tracking-wider">Resources</span>
          <nav className="flex flex-col gap-2 text-body-m text-muted">
            <Link href="/grants" className="hover:text-rift-red transition-colors">Grants Hub</Link>
            <Link href="/newsletter" className="hover:text-rift-red transition-colors">Newsletter Alert</Link>
            <Link href="/search" className="hover:text-rift-red transition-colors">Search Articles</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-label text-off-white font-bold tracking-wider">Legal</span>
          <nav className="flex flex-col gap-2 text-body-m text-muted">
            <Link href="/privacy" className="hover:text-rift-red transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-rift-red transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-rift-red transition-colors">Cookie Policy</Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-label text-muted">
        <span>&copy; {new Date().getFullYear()} NOWRIFT. All rights reserved.</span>
        <span>Powered by CRAM Services</span>
      </div>
    </footer>
  );
}

export default Footer;
