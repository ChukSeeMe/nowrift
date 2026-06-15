import React from 'react';
import Link from 'next/link';
import { 
  IconLayoutDashboard, 
  IconNews, 
  IconGift, 
  IconUsers, 
  IconCpu, 
  IconBriefcase, 
  IconTrendingUp,
  IconLogout
} from '@tabler/icons-react';
import Logo from '../ui/Logo';
import { AdminSession } from '@/lib/auth/jwt-edge';
import { signOut } from '@/app/admin/actions';

interface AdminNavProps {
  session: AdminSession;
}

export function AdminNav({ session }: AdminNavProps) {
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: IconLayoutDashboard },
    { name: 'Articles', href: '/admin/articles', icon: IconNews },
    { name: 'Grants', href: '/admin/grants', icon: IconGift },
    { name: 'Users', href: '/admin/users', icon: IconUsers },
    { name: 'Agents', href: '/admin/agents', icon: IconCpu },
    { name: 'Sponsors', href: '/admin/sponsors', icon: IconBriefcase },
    { name: 'Analytics', href: '/admin/analytics', icon: IconTrendingUp },
  ];

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#1E1E2A] bg-near-black flex flex-col h-screen sticky top-0">
      {/* Brand logo */}
      <div className="p-6 border-b border-[#1E1E2A]">
        <Link href="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-body-m font-medium text-muted hover:text-off-white hover:bg-surface/50 transition-colors"
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User profile & signout */}
      <div className="p-4 border-t border-[#1E1E2A] bg-[#0d0d14] flex flex-col gap-3">
        <div className="flex flex-col">
          <span className="text-body-m font-semibold text-off-white truncate">
            {session.role.toUpperCase()}
          </span>
          <span className="text-label text-muted truncate">
            {session.userId.substring(0, 8)}...
          </span>
        </div>

        <form action={signOut} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/80 text-label font-bold text-rift-red hover:bg-rift-red/5 hover:border-rift-red/20 transition-all cursor-pointer"
          >
            <IconLogout size={14} />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

export default AdminNav;
