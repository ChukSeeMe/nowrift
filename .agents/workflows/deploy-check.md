---
description: Run deployment checks on NowRift
---
1. Run `tsc --noEmit` to ensure there are no compilation errors
2. Run build step with `npm run build` or equivalent to ensure everything builds correctly
3. Verify security checklist: CSP headers, X-Frame-Options, secure cookies, CSRF setup
4. Verify PWA manifest and service worker setup
5. Verify Core Web Vitals target via local test or Lighthouse
