import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth/jwt-edge';
import { AdminSessionProvider } from '@/components/admin/AdminSessionProvider';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect('/login');
  }

  const isAdminRole = ['admin', 'super_admin'].includes(session.role);
  if (isAdminRole && !session.totp_enabled && process.env.NODE_ENV === 'production') {
    redirect('/admin/setup-2fa');
  }

  return (
    <AdminSessionProvider session={session}>
      <div className="flex min-h-screen bg-near-black text-off-white">
        <AdminNav session={session} />
        <main className="flex-grow p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </AdminSessionProvider>
  );
}
