import React from 'react';
import Nav from '@/components/layout/Nav';
import BreakingTicker from '@/components/layout/BreakingTicker';
import Footer from '@/components/layout/Footer';
import { 
  IconBrandDiscord, 
  IconMessageCode, 
  IconHelp, 
  IconRocket, 
  IconShield, 
  IconQuote 
} from '@tabler/icons-react';

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string;
  channels: any[];
  members: any[];
  presence_count: number;
}

async function getDiscordWidget(serverId?: string): Promise<DiscordWidgetData | null> {
  if (!serverId) return null;
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${serverId}/widget.json`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CommunityPage() {
  const serverId = process.env.DISCORD_SERVER_ID;
  const inviteUrl = process.env.DISCORD_INVITE_URL;
  
  const isConfigured = !!(
    serverId && 
    inviteUrl && 
    inviteUrl !== '' && 
    !inviteUrl.includes('your-invite-code')
  );

  // Fetch widget data if configured
  const widgetData = isConfigured ? await getDiscordWidget(serverId) : null;
  const onlineCount = widgetData?.presence_count;

  // Manually curated highlights
  const highlights = [
    {
      quote: "Someone in #grants-help found the EIC Accelerator deadline extension before it was even on our site.",
      context: "From #grants-help",
    },
    {
      quote: "Had an engaging discussion in #ai-models on inference-time compute scaling. Completely changed how I approach my agentic planning loop.",
      context: "From #ai-models",
    },
    {
      quote: "Met our first backer in #showcase-your-project. We are launching our private beta next month!",
      context: "From #showcase-your-project",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-near-black text-off-white">
      <Nav />
      <BreakingTicker />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">
        
        {/* Hero Section */}
        <section className="relative p-8 md:p-12 bg-surface border border-border rounded-2xl flex flex-col items-center text-center gap-6 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-rift-red/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-dev-blue/5 rounded-full blur-3xl pointer-events-none" />

          {/* Discord Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-dev-blue shadow-inner">
            <IconBrandDiscord size={36} />
          </div>

          {/* Live status badge */}
          {isConfigured && onlineCount !== undefined && onlineCount > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-near-black/50 border border-border rounded-full text-label font-bold text-grant-green">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-grant-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-grant-green"></span>
              </span>
              <span>{onlineCount} members online now</span>
            </div>
          )}

          <h1 className="text-display-xl font-bold max-w-2xl leading-tight">
            Join the conversation
          </h1>
          
          <p className="text-body-l text-muted max-w-xl leading-relaxed">
            Where builders, founders, and security researchers discuss what's actually happening in tech — before it hits the feed.
          </p>

          {isConfigured ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-rift-red hover:bg-rift-red/90 text-near-black font-extrabold uppercase text-label tracking-wider rounded-xl transition-all transform hover:scale-105 duration-200 shadow-lg shadow-rift-red/10 cursor-pointer"
            >
              <IconBrandDiscord size={18} />
              Join our Discord
            </a>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                disabled
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-border text-muted font-extrabold uppercase text-label tracking-wider rounded-xl cursor-not-allowed"
              >
                <IconBrandDiscord size={18} />
                Discord Server Offline
              </button>
              <p className="text-body-m text-muted italic mt-2">
                Our community space is launching soon. Stay tuned!
              </p>
            </div>
          )}
        </section>

        {/* What Happens Here Section */}
        <section className="flex flex-col gap-8">
          <div className="border-b border-border/60 pb-4">
            <h2 className="text-display-l font-bold text-off-white">
              What happens inside the server?
            </h2>
            <p className="text-body-m text-muted mt-1">
              Collaborate and trade ideas across our core community topics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 bg-surface border border-border rounded-xl flex flex-col gap-3 group hover:border-border/80 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-dev-blue/10 text-dev-blue flex items-center justify-center border border-dev-blue/20">
                <IconMessageCode size={20} />
              </div>
              <h3 className="text-display-m font-bold text-off-white group-hover:text-dev-blue transition-colors">
                Daily AI Digest
              </h3>
              <p className="text-body-m text-muted leading-relaxed">
                Discuss the latest model releases, fine-tuning guides, and reasoning scaling architectures with other builders.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-surface border border-border rounded-xl flex flex-col gap-3 group hover:border-border/80 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-grant-green/10 text-grant-green flex items-center justify-center border border-grant-green/20">
                <IconHelp size={20} />
              </div>
              <h3 className="text-display-m font-bold text-off-white group-hover:text-grant-green transition-colors">
                Grants Help & Advice
              </h3>
              <p className="text-body-m text-muted leading-relaxed">
                Connect with team members and peers who apply for public tech funding. Discuss guidelines and review applications.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-surface border border-border rounded-xl flex flex-col gap-3 group hover:border-border/80 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-founders-purple/10 text-founders-purple flex items-center justify-center border border-founders-purple/20">
                <IconRocket size={20} />
              </div>
              <h3 className="text-display-m font-bold text-off-white group-hover:text-founders-purple transition-colors">
                Showcase Your Project
              </h3>
              <p className="text-body-m text-muted leading-relaxed">
                Got a new tool or MVP? Share it in our showcase channel to solicit early developer feedback and find co-founders.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 bg-surface border border-border rounded-xl flex flex-col gap-3 group hover:border-border/80 transition-all duration-200">
              <div className="w-10 h-10 rounded-lg bg-rift-red/10 text-rift-red flex items-center justify-center border border-rift-red/20">
                <IconShield size={20} />
              </div>
              <h3 className="text-display-m font-bold text-off-white group-hover:text-rift-red transition-colors">
                Cybersecurity Updates
              </h3>
              <p className="text-body-m text-muted leading-relaxed">
                Stay on top of critical system patches, zero-days, and security guidelines discussed by industry researchers.
              </p>
            </div>

          </div>
        </section>

        {/* Highlights Section */}
        {highlights.length > 0 && (
          <section className="flex flex-col gap-8">
            <div className="border-b border-border/60 pb-4">
              <h2 className="text-display-l font-bold text-off-white">
                Community Highlights
              </h2>
              <p className="text-body-m text-muted mt-1">
                 Paraphrased moments and takeaways from notable server discussions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="p-6 bg-surface/50 border border-border rounded-xl relative overflow-hidden flex flex-col justify-between gap-4 border-l-4 border-l-rift-red"
                >
                  <div className="absolute top-2 right-2 text-border/40 pointer-events-none">
                    <IconQuote size={32} />
                  </div>
                  <p className="text-body-m text-off-white italic relative z-10 leading-relaxed">
                    "{highlight.quote}"
                  </p>
                  <span className="text-label text-muted font-bold block">
                    {highlight.context}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Second CTA Section */}
        {isConfigured && (
          <section className="p-8 bg-surface/30 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <h3 className="text-display-m font-bold text-off-white">
                Ready to participate?
              </h3>
              <p className="text-body-m text-muted">
                Join our Discord workspace now and discuss tech with our editors.
              </p>
            </div>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-rift-red hover:bg-rift-red/90 text-near-black font-extrabold uppercase text-label tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Join the Chat
            </a>
          </section>
        )}

      </main>
      <Footer />
    </div>
  );
}
