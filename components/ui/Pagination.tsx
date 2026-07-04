interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Build URL for a given page number, preserving other search params
  function pageUrl(page: number): string {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') params.set(key, value)
    })
    if (page > 1) params.set('page', String(page))
    const query = params.toString()
    return query ? `${baseUrl}?${query}` : baseUrl
  }

  // Show max 7 page numbers with ellipsis for large ranges
  function getPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    if (currentPage > 3) pages.push('ellipsis')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }

  return (
    <nav
      aria-label="Article pages"
      className="pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '2.5rem 0 3rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
      }}
    >
      {/* Previous button */}
      {currentPage > 1 ? (
        <a
          href={pageUrl(currentPage - 1)}
          style={{
            padding: '8px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-muted)',
            textDecoration: 'none',
            transition: 'border-color 0.15s, color 0.15s',
          }}
        >
          ← Prev
        </a>
      ) : (
        <span style={{
          padding: '8px 14px',
          color: 'var(--color-border)',
          cursor: 'not-allowed',
        }}>
          ← Prev
        </span>
      )}

      {/* Page numbers */}
      {getPageNumbers().map((page, i) =>
        page === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            style={{ padding: '8px 6px', color: 'var(--color-muted)' }}
          >
            …
          </span>
        ) : (
          <a
            key={page}
            href={pageUrl(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            style={{
              padding: '8px 13px',
              border: '1px solid',
              borderColor:
                page === currentPage
                  ? 'var(--color-rift-red)'
                  : 'var(--color-border)',
              borderRadius: '4px',
              color:
                page === currentPage
                  ? 'var(--color-rift-red)'
                  : 'var(--color-muted)',
              textDecoration: 'none',
              fontWeight: page === currentPage ? '600' : '400',
              background:
                page === currentPage
                  ? 'rgba(255, 61, 61, 0.08)'
                  : 'transparent',
            }}
          >
            {page}
          </a>
        )
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <a
          href={pageUrl(currentPage + 1)}
          style={{
            padding: '8px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: '4px',
            color: 'var(--color-muted)',
            textDecoration: 'none',
          }}
        >
          Next →
        </a>
      ) : (
        <span style={{
          padding: '8px 14px',
          color: 'var(--color-border)',
          cursor: 'not-allowed',
        }}>
          Next →
        </span>
      )}

      {/* Page count summary */}
      <span style={{
        marginLeft: '12px',
        color: 'var(--color-muted)',
        fontSize: '11px',
        letterSpacing: '0.5px',
      }}>
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  )
}
