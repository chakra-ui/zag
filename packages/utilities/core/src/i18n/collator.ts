import { cached } from "./cache"

const getCollator = /*#__PURE__*/ cached<Intl.CollatorOptions, typeof Intl.Collator>(Intl.Collator)

/**
 * Returns a cached `Intl.Collator`.
 */
export function createCollator(locale: string = "en-US", options: Intl.CollatorOptions = {}): Intl.Collator {
  return getCollator(locale, options)
}
