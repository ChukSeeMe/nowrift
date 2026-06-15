import { NextRequest, NextResponse } from 'next/server';
import prisma, { setRlsContext } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Unsubscribe token is missing', code: 'MISSING_TOKEN', status: 400 },
      { status: 400 }
    );
  }

  try {
    await setRlsContext(null, 'super_admin');

    const alert = await prisma.grantAlert.findFirst({
      where: { unsubscribe_token: token },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token', code: 'INVALID_TOKEN', status: 404 },
        { status: 404 }
      );
    }

    await prisma.grantAlert.update({
      where: { id: alert.id },
      data: { active: false },
    });

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en" style="background-color: #0A0A0F; color: #F0F0F5; font-family: sans-serif; height: 100%; display: flex; align-items: center; justify-content: center; margin: 0;">
        <head>
          <meta charset="utf-8">
          <title>Unsubscribed - NowRift Grants</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="text-align: center; max-width: 400px; padding: 32px 24px; border: 1px solid #2A2A38; border-radius: 12px; background-color: #1A1A24; margin: 16px;">
          <h2 style="color: #FF3D3D; font-size: 24px; margin-top: 0; margin-bottom: 16px; font-weight: bold; letter-spacing: -0.5px;">NOW//RIFT</h2>
          <p style="font-size: 16px; margin-bottom: 12px; line-height: 1.5;">You have been successfully unsubscribed from tech grant alerts.</p>
          <p style="color: #8B8BA0; font-size: 13px; line-height: 1.5; margin-bottom: 24px;">You will no longer receive automated notifications about open funding rounds.</p>
          <a href="/" style="display: inline-block; color: #4FA3F5; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Return to Home</a>
        </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error: any) {
    console.error('Grant unsubscribe error:', error);
    return NextResponse.json(
      { error: 'An error occurred while unsubscribing', code: 'SERVER_ERROR', status: 500 },
      { status: 500 }
    );
  }
}
