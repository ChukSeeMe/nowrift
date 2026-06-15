import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import GrantEditFormClient from '@/components/admin/GrantEditFormClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGrantPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const grant = await prisma.grant.findUnique({
    where: { id },
  });

  if (!grant) {
    notFound();
  }

  return (
    <GrantEditFormClient grant={grant} />
  );
}
