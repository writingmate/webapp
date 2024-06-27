type NameTitleWithHashID = {
  name?: string
  title?: string
  hashid: string
}

const MAX_SLUG_LENGTH = 100

export function slugify(item: NameTitleWithHashID): string {
  if (!item.hashid) {
    console.error("hashid is required")
    return ""
  }
  const nameDash = (item.name || item.title)
    ?.trim()
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .slice(0, MAX_SLUG_LENGTH)
  return `${item.hashid}-${nameDash}`
}

export function parseIdFromSlug(slug: string): string {
  if (!slug) {
    return ""
  }
  return slug.split("-")[0]
}
