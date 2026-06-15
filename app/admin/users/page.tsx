import React from 'react';
import prisma from '@/lib/db/prisma';
import UsersAdminClient from '@/components/admin/UsersAdminClient';

export const dynamic = 'force-dynamic';

export default async function UsersAdminPage() {
  // Retrieve users with roles
  const users = await prisma.user.findMany({
    include: {
      user_roles: {
        include: {
          role: true,
        },
      },
    },
    orderBy: { created_at: 'desc' },
  });

  // Fetch roles list for selectors
  const roles = await prisma.role.findMany({
    orderBy: { hierarchy_level: 'asc' },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display-xl text-off-white">User Accounts</h1>
        <p className="text-body-l text-muted">Manage roles, suspend access, and invite new editorial staff.</p>
      </div>

      <UsersAdminClient
        users={users}
        roles={roles}
      />
    </div>
  );
}
