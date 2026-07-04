'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconMenu2, IconX, IconSearch } from '@tabler/icons-react';
import Logo from '../ui/Logo';

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth/status');
        if (res.ok) {
          const data = await res.json();
          if (data.role && ['editor', 'senior_editor', 'admin', 'super_admin'].includes(data.role)) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        // Silently fail
      }
    };
    checkAuthStatus();
  }, [pathname]);

  const navLinks = [
    { name: 'Feed', href: '/' },
    { name: 'Deep Dives', href: '/deep-dives' },
    { name: 'Grants', href: '/grants' },
    { name: 'Community', href: '/community' },
    { name: 'Tools', href: '/tools' },
    { name: 'Newsletter', href: '/newsletter' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-near-black/85 backdrop-blur-md border-b border-border/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Logo size="sm" className="text-off-white hover:text-off-white/95" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-body-m font-medium transition-colors ${
                    isActive ? 'text-rift-red' : 'text-muted hover:text-off-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className="text-body-m font-bold text-dev-blue hover:text-dev-blue/80 transition-colors border border-dev-blue/20 bg-dev-blue/5 px-3 py-1 rounded-md"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="text-muted hover:text-off-white transition-colors p-2"
              aria-label="Search"
            >
              <IconSearch size={20} />
            </Link>

            <Link
              href="/newsletter"
              className="inline-flex items-center justify-center px-4 py-2 text-label font-bold tracking-wider uppercase text-near-black bg-off-white hover:bg-off-white/90 rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/search"
              className="text-muted hover:text-off-white transition-colors p-2"
              aria-label="Search"
            >
              <IconSearch size={20} />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted hover:text-off-white p-2 shrink-0 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border/80 bg-near-black/95 px-4 pt-2 pb-4 space-y-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-body-l font-medium ${
                  isActive ? 'text-rift-red bg-surface/50' : 'text-muted hover:text-off-white hover:bg-surface/30'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-body-l font-bold text-dev-blue bg-dev-blue/5 border border-dev-blue/20"
            >
              Admin Panel
            </Link>
          )}

          <div className="pt-2 border-t border-border/60">
            <Link
              href="/newsletter"
              onClick={() => setIsOpen(false)}
              className="w-full text-center block px-4 py-2.5 text-label font-bold tracking-wider uppercase text-near-black bg-off-white hover:bg-off-white/90 rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Nav;
