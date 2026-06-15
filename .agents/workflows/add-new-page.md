---
description: Add a new public-facing page to NowRift
---
1. Create the page file in `app/(public)/[route]/page.tsx`
2. Add `generateMetadata()` function with title, description, og:image
3. Implement server-side data fetching with appropriate revalidate value
4. Build the page layout using existing components where possible
5. Add the route to `robots.txt` if it should be indexed
6. Run `tsc --noEmit` and fix all errors
7. Test on mobile viewport (320px) in Antigravity browser agent
