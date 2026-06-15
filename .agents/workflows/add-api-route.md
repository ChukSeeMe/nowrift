---
description: Add a new API route to NowRift
---
1. Create `app/api/v1/[route]/route.ts`
2. Add Zod schema for request validation
3. Add auth middleware call (check role requirement)
4. Add rate limiting for public routes
5. Set RLS context before any Prisma query
6. Write the Prisma query using queries from lib/db/queries/
7. Return consistent response shape
8. Add audit log entry for write operations
9. Run `tsc --noEmit`
