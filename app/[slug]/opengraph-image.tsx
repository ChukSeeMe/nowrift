import { ImageResponse } from 'next/og';
import prisma from '@/lib/db/prisma';

export const runtime = 'edge';

export const alt = 'NowRift Article';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      channel: true,
      audit_record: true,
      sources: true,
    },
  });

  if (!article) {
    return new Response('Article not found', { status: 404 });
  }

  // Fetch fonts from CDN
  const [spaceGroteskBold, jetbrainsMono] = await Promise.all([
    fetch(new URL('https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.woff')).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.woff')).then((res) =>
      res.arrayBuffer()
    ),
  ]);

  const channelName = article.channel?.name || 'TECHNOLOGY';
  const channelColor = article.channel?.color_hex || '#FF3D3D';
  const sourceCount = article.audit_record?.source_count || article.sources?.length || 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0A0A0F',
          color: '#F0F0F5',
          padding: '40px',
          justifyContent: 'space-between',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Diagonal Rift Accent (Decorative, top-right quadrant, opacity 0.25) */}
        <svg
          width="350"
          height="350"
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            opacity: 0.25,
          }}
          viewBox="0 0 350 350"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="rotate(14 175 175)">
            <rect x="165" y="-50" width="2" height="450" fill="#FF3D3D" />
            <rect x="182" y="-50" width="2" height="450" fill="#FF3D3D" />
          </g>
        </svg>

        {/* Top Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Logo Mark (letters NR with diagonal red lines) */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg
              width="80"
              height="40"
              viewBox="0 0 80 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'flex' }}
            >
              <text
                x="5"
                y="30"
                fill="white"
                fontSize="28"
                fontFamily="Space Grotesk"
                fontWeight="bold"
              >
                N
              </text>
              <text
                x="32"
                y="30"
                fill="white"
                fontSize="28"
                fontFamily="Space Grotesk"
                fontWeight="bold"
              >
                R
              </text>
              <g transform="rotate(14 30 20)">
                <rect x="25" y="-10" width="2.5" height="60" fill="#FF3D3D" />
                <rect x="33" y="-10" width="2.5" height="60" fill="#FF3D3D" />
              </g>
            </svg>
          </div>

          {/* Domain name */}
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: '#8B8BA0',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            NOWRIFT.COM
          </div>
        </div>

        {/* Headline block (vertically centered) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '1060px',
            marginTop: 'auto',
            marginBottom: 'auto',
            paddingTop: '20px',
            paddingBottom: '20px',
          }}
        >
          <div
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: '48px',
              fontWeight: 700,
              color: '#F0F0F5',
              lineHeight: 1.2,
            }}
          >
            {article.headline}
          </div>
        </div>

        {/* Bottom Strip Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Left: Channel tag pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: `${channelColor}26`, // 15% opacity
              border: `1px solid ${channelColor}4D`, // 30% opacity
              borderRadius: '4px',
              padding: '6px 14px',
            }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                fontWeight: 600,
                color: channelColor,
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {channelName}
            </span>
          </div>

          {/* Center: Source count */}
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '10px',
              color: '#4A4A62',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {sourceCount} {sourceCount === 1 ? 'SOURCE' : 'SOURCES'} SYNTHESISED
          </div>

          {/* Right: Verified Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#1D9E75',
              }}
            />
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
                fontWeight: 600,
                color: '#1D9E75',
                letterSpacing: '1px',
              }}
            >
              VERIFIED
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Space Grotesk',
          data: spaceGroteskBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'JetBrains Mono',
          data: jetbrainsMono,
          style: 'normal',
          weight: 500,
        },
      ],
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=86400',
      },
    }
  );
}
