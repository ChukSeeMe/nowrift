import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma, { setRlsContext } from '@/lib/db/prisma';
import { resend } from '@/lib/resend';

const grantAlertSchema = z.object({
  email: z.string().email(),
  sectors: z.array(z.string()),
  geo_regions: z.array(z.string()),
  entity_types: z.array(z.string()),
  alert_frequency: z.enum(['instant', 'daily', 'weekly']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = grantAlertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', code: 'INVALID_PARAMETERS', status: 400 },
        { status: 400 }
      );
    }

    const { email, sectors, geo_regions, entity_types, alert_frequency } = parsed.data;
    const cleanEmail = email.toLowerCase();

    await setRlsContext(null, 'super_admin');

    const alert = await prisma.grantAlert.upsert({
      where: { subscriber_email: cleanEmail },
      create: {
        subscriber_email: cleanEmail,
        preferences: { sectors, geo_regions, entity_types },
        sectors,
        geo_regions,
        entity_types,
        alert_frequency,
        active: true,
      },
      update: {
        preferences: { sectors, geo_regions, entity_types },
        sectors,
        geo_regions,
        entity_types,
        alert_frequency,
        active: true,
        updated_at: new Date(),
      },
    });

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'grants@nowrift.com';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nowrift.com';
    const unsubUrl = `${appUrl}/api/v1/grant-alerts/unsubscribe?token=${alert.unsubscribe_token}`;

    try {
      await resend.emails.send({
        from: `NowRift Grants <${fromEmail}>`,
        to: cleanEmail,
        subject: 'Confirmed: Your NowRift Grant Alerts',
        html: `
          <div style="font-family: sans-serif; background-color: #0A0A0F; color: #F0F0F5; padding: 24px; border-radius: 8px;">
            <h2 style="color: #FF3D3D; font-family: 'Space Grotesk', sans-serif;">NowRift Grants</h2>
            <p>Your subscription to tech grant alerts has been successfully set up!</p>
            <p><strong>Frequency:</strong> ${alert_frequency.toUpperCase()}</p>
            <p><strong>Sectors:</strong> ${sectors.join(', ')}</p>
            <p><strong>Regions:</strong> ${geo_regions.join(', ')}</p>
            <br />
            <hr style="border: 0; border-top: 1px solid #2A2A38;" />
            <p style="font-size: 12px; color: #8B8BA0;">
              To unsubscribe from these alerts, <a href="${unsubUrl}" style="color: #FF3D3D;">click here</a>.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Resend email failed to send:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Grant alerts subscription registered successfully',
      alert_id: alert.id,
    });
  } catch (error: any) {
    console.error('Grant alerts subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to grant alerts', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
