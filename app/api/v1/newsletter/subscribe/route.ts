import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma, { setRlsContext } from '@/lib/db/prisma';
import { subscribeToBeehiiv } from '@/lib/beehiiv';

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address', code: 'INVALID_EMAIL', status: 400 },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();

    const beehiivData = await subscribeToBeehiiv(email);

    // Write public subscription using system context
    await setRlsContext(null, 'super_admin');

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        status: 'active',
        source: 'homepage_cta',
        beehiiv_id: beehiivData.id,
      },
      update: {
        status: 'active',
        beehiiv_id: beehiivData.id,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      subscriber_id: subscriber.id,
    });
  } catch (error: any) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
