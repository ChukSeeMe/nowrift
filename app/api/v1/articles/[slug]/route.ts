import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const userId = request.headers.get('x-user-id') || null;
  const userRole = request.headers.get('x-user-role') || 'visitor';

  try {
    await setRlsContext(userId, userRole);

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        channel: true,
        images: true,
        audit_record: true,
        sources: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', code: 'ARTICLE_NOT_FOUND', status: 404 },
        { status: 404 }
      );
    }

    const isOwner = article.created_by === userId;
    const isEditor = ['editor', 'senior_editor', 'admin', 'super_admin'].includes(userRole);
    if (article.status !== 'published' && !isOwner && !isEditor) {
      return NextResponse.json(
        { error: 'Unauthorized to view this article', code: 'UNAUTHORIZED_ARTICLE', status: 403 },
        { status: 403 }
      );
    }

    return NextResponse.json({ article });
  } catch (error: any) {
    console.error('Fetch article by slug error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve article details', code: 'DATABASE_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
