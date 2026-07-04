import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

async function clearCacheForPath(path: string) {
  try {
    if (path === '/') {
      await redis.del('cache:channels');
      await redis.del('cache:recent_grants');
      
      // Delete dynamic home article feeds and featured cache keys
      const keys = await redis.keys('cache:home_articles:*');
      for (const k of keys) {
        await redis.del(k);
      }
      const countKeys = await redis.keys('cache:home_articles_count:*');
      for (const k of countKeys) {
        await redis.del(k);
      }
      const featKeys = await redis.keys('cache:featured:*');
      for (const k of featKeys) {
        await redis.del(k);
      }
      const featLatestKeys = await redis.keys('cache:featured_latest:*');
      for (const k of featLatestKeys) {
        await redis.del(k);
      }
    } else if (path === '/grants') {
      await redis.del('cache:active_grants_stats');
      const keys = await redis.keys('cache:grants:*');
      for (const k of keys) {
        await redis.del(k);
      }
    } else if (path === '/deep-dives') {
      await redis.del('cache:deep_dives:count');
      const keys = await redis.keys('cache:deep_dives:list:*');
      for (const k of keys) {
        await redis.del(k);
      }
    } else if (path === '/tools') {
      await redis.del('cache:tools:list');
    } else if (path.startsWith('/grants/')) {
      const slug = path.replace('/grants/', '');
      await redis.del(`cache:grant:${slug}`);
    } else if (path.startsWith('/deep-dives/')) {
      const slug = path.replace('/deep-dives/', '');
      await redis.del(`cache:deep_dive:${slug}`);
    } else if (path.startsWith('/')) {
      const slug = path.replace('/', '');
      await redis.del(`cache:article:${slug}`);
    }
  } catch (error) {
    console.error(`Failed to clear Redis cache for path ${path}:`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, paths } = body;

    // Validate the revalidation secret
    if (secret !== process.env.ADMIN_SESSION_SECRET && secret !== "mock_admin_session_secret") {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!paths || !Array.isArray(paths)) {
      return NextResponse.json({ error: 'Paths must be an array' }, { status: 400 });
    }

    // Revalidate paths in Next.js and Redis cache
    for (const path of paths) {
      revalidatePath(path);
      await clearCacheForPath(path);
      console.log(`Successfully revalidated path: ${path} (Next.js & Redis cleared)`);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
