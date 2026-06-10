/**
 * Shared query helper utilities to eliminate duplicated
 * pagination and date filter logic across controllers.
 */

interface DateFilter {
  $gte?: Date;
  $lte?: Date;
}

/**
 * Build a MongoDB date range filter from optional start/end date strings.
 * Returns undefined if no dates provided.
 */
export function buildDateFilter(
  startDate?: string,
  endDate?: string,
): DateFilter | undefined {
  if (!startDate && !endDate) return undefined;

  const filter: DateFilter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return filter;
}

// Hard cap so a client cannot request an unbounded page size (DoS guard)
const MAX_LIMIT = 100;

/**
 * Parse pagination params from query string values.
 * Returns skip count and numeric limit (capped at MAX_LIMIT).
 */
export function parsePagination(
  page?: unknown,
  limit?: unknown,
): { skip: number; limit: number; page: number } {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(Math.max(1, Number(limit) || 20), MAX_LIMIT);
  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum,
  };
}

/**
 * Build standard pagination meta object for API responses.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  return {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit,
  };
}
