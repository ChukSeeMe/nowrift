import React from 'react';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import ArticleEditorClient from './ArticleEditorClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArticleReviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Retrieve the article
  const article = await prisma.article.findUnique({
    where: { id },
    include: {
      channel: true,
      audit_record: true,
      sources: true,
    },
  });

  if (!article) {
    notFound();
  }

  // Fetch channels list for channel selectors dropdown
  const channels = await prisma.channel.findMany({
    orderBy: { sort_order: 'asc' },
  });

  return (
    <ArticleEditorClient
      article={article}
      channels={channels}
    />
  );
}
