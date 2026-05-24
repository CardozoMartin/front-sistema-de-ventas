export type PageToken = number | "ellipsis";

export const ITEMS_PER_PAGE = 10;

/** Páginas visibles con elipsis (máx. ~7 botones numéricos). */
export function getVisiblePages(
  current: number,
  total: number,
  siblingCount = 1
): PageToken[] {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: PageToken[] = [1];
  const start = Math.max(2, current - siblingCount);
  const end = Math.min(total - 1, current + siblingCount);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);

  return pages;
}
