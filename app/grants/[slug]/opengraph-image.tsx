import { ImageResponse } from 'next/og';
import prisma from '@/lib/db/prisma';

export const runtime = 'edge';

export const alt = 'NowRift Grant';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const grant = await prisma.grant.findUnique({
    where: { slug },
  });

  if (!grant) {
    return new Response('Grant not found', { status: 404 });
  }

  // Fetch fonts from CDN
  const [spaceGroteskBold, spaceGroteskSemiBold, jetbrainsMono] = await Promise.all([
    fetch(new URL('https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-700-normal.woff')).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('https://cdn.jsdelivr.net/fontsource/fonts/space-grotesk@latest/latin-600-normal.woff')).then((res) =>
      res.arrayBuffer()
    ),
    fetch(new URL('https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.woff')).then((res) =>
      res.arrayBuffer()
    ),
  ]);

  // Funding range formatter
  const formatAmount = (val: any) => {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    
    // Map currency code to symbol for clean render
    const currencyMap: Record<string, string> = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    const symbol = currencyMap[grant.currency] || '$';
    
    return symbol + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  const minFormatted = formatAmount(grant.funding_min);
  const maxFormatted = formatAmount(grant.funding_max);

  let fundingLabel = 'Funding Unspecified';
  if (minFormatted && maxFormatted) {
    if (minFormatted === maxFormatted) {
      fundingLabel = minFormatted;
    } else {
      fundingLabel = `${minFormatted} – ${maxFormatted}`;
    }
  } else if (maxFormatted) {
    fundingLabel = `Up to ${maxFormatted}`;
  } else if (minFormatted) {
    fundingLabel = `From ${minFormatted}`;
  }

  // Deadline formatting & urgency check
  let deadlineLabel = 'Rolling Deadline';
  let deadlineColor = '#8B8BA0'; // muted

  if (grant.deadline) {
    const deadlineDate = new Date(grant.deadline);
    deadlineLabel = `Closes ${deadlineDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}`;

    const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 14) {
      deadlineColor = '#FF3D3D'; // red
    } else if (daysLeft > 0 && daysLeft <= 30) {
      deadlineColor = '#EF9F27'; // amber
    } else if (daysLeft <= 0) {
      deadlineColor = '#8B8BA0'; // muted
      deadlineLabel = 'Closed';
    }
  }

  // Status mapping
  const normalizedStatus = grant.status.toLowerCase();
  let statusLabel = grant.status.replace('_', ' ').toUpperCase();
  let statusColor = '#1D9E75'; // default green

  if (normalizedStatus === 'open' || normalizedStatus === 'closing_soon') {
    if (grant.deadline) {
      const daysLeft = Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 30) {
        statusColor = '#EF9F27'; // amber
        statusLabel = 'CLOSING SOON';
      } else if (daysLeft <= 0) {
        statusColor = '#8B8BA0'; // muted
        statusLabel = 'CLOSED';
      } else {
        statusColor = '#1D9E75'; // green
        statusLabel = 'OPEN';
      }
    } else {
      statusColor = '#1D9E75';
      statusLabel = 'OPEN';
    }
  } else if (normalizedStatus === 'closed') {
    statusColor = '#8B8BA0';
    statusLabel = 'CLOSED';
  } else if (normalizedStatus === 'awarded') {
    statusColor = '#B47FDD'; // purple
    statusLabel = 'AWARDED';
  } else if (normalizedStatus === 'draft') {
    statusColor = '#8B8BA0';
    statusLabel = 'DRAFT';
  }

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
          padding: '40px 40px 40px 60px', // slightly wider left padding for green vertical bar
          justifyContent: 'space-between',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Green Accent Line */}
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: 0,
            width: '3px',
            height: '100%',
            backgroundColor: '#1D9E75',
          }}
        />

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
            NOWRIFT.COM / GRANTS
          </div>
        </div>

        {/* Center Content Section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          {/* Funder Name */}
          <div
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: '18px',
              fontWeight: 600,
              color: '#8B8BA0',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {grant.funder_name}
          </div>

          {/* Grant Title */}
          <div
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: '44px',
              fontWeight: 700,
              color: '#F0F0F5',
              lineHeight: 1.2,
              marginBottom: '20px',
            }}
          >
            {grant.title}
          </div>

          {/* Funding Amount */}
          <div
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: '32px',
              fontWeight: 700,
              color: '#1D9E75',
            }}
          >
            {fundingLabel}
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
          {/* Left: Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: `${statusColor}1A`, // 10% opacity
              border: `1px solid ${statusColor}4D`, // 30% opacity
              borderRadius: '4px',
              padding: '6px 14px',
            }}
          >
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: '11px',
                fontWeight: 600,
                color: statusColor,
                letterSpacing: '1px',
              }}
            >
              {statusLabel}
            </span>
          </div>

          {/* Center: Geographic scope pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {grant.geo_scope.map((geo, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#1A1A24',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  border: '1px solid #2A2A38',
                }}
              >
                <span
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#F0F0F5',
                    textTransform: 'uppercase',
                  }}
                >
                  {geo}
                </span>
              </div>
            ))}
          </div>

          {/* Right: Deadline */}
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              fontWeight: 600,
              color: deadlineColor,
              letterSpacing: '0.5px',
            }}
          >
            {deadlineLabel}
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
          name: 'Space Grotesk',
          data: spaceGroteskSemiBold,
          style: 'normal',
          weight: 600,
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
