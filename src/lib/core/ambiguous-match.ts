/**
 * Checks one model answer from the batch. Only slugs that exist in the
 * ingredients table count, so a bad answer never invents an ingredient.
 */
export function sanitizeMatch(
  raw: unknown,
  knownSlugs: ReadonlySet<string>,
): string | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { slug } = raw as { slug?: unknown };
  if (typeof slug !== "string") return null;
  const trimmed = slug.trim();
  return knownSlugs.has(trimmed) ? trimmed : null;
}
