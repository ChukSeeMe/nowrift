import { MetadataRoute } from 'next';
import prisma from '@/lib/db/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updated_at: true },
    orderBy: { published_at: 'desc' },
    take: 1000,
  });

  const grants = await prisma.grant.findMany({
    where: { status: { in: ['open', 'closing_soon'] } },
    select: { slug: true, updated_at: true },
  });

  const articleUrls = articles.map(a => ({
    url: `https://nowrift.com/${a.slug}`,
    lastModified: a.updated_at,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const grantUrls = grants.map(g => ({
    url: `https://nowrift.com/grants/${g.slug}`,
    lastModified: g.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: 'https://nowrift.com',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: 'https://nowrift.com/grants',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://nowrift.com/deep-dives',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...articleUrls,
    ...grantUrls,
  ];
}
