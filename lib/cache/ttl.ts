export const CACHE_TTL = {
  // Changes every few hours — long ISR revalidation
  ARTICLE_LIST:        300,   // 5 minutes
  ARTICLE_DETAIL:      600,   // 10 minutes
  CHANNEL_FEED:        300,   // 5 minutes

  // Changes infrequently
  GRANTS_LIST:         900,   // 15 minutes
  GRANT_DETAIL:        1800,  // 30 minutes
  DEEP_DIVES_LIST:     1800,  // 30 minutes
  TOOLS_LIST:          3600,  // 1 hour

  // Changes rarely
  COMMUNITY_WIDGET:    300,   // 5 minutes (Discord widget)
  NEWSLETTER_STATS:    3600,  // 1 hour

  // Must be near real-time
  BREAKING_TICKER:     60,    // 1 minute
  AGENT_STATUS:        30,    // 30 seconds

  // Never cache — always fresh
  ADMIN_DASHBOARD:     0,
  SEARCH_RESULTS:      0,
};
