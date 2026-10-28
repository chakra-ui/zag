import { describe, expect, test } from "vitest"
import { mergedPageRedirects } from "../redirects.mjs"

const merged = {
  "nested-menu": "menu#nested-menus",
  "range-slider": "slider#range-slider",
  "linear-progress": "progress#linear",
  "circular-progress": "progress#circular",
}

describe("mergedPageRedirects", () => {
  for (const [slug, target] of Object.entries(merged)) {
    test(`${slug} redirects with and without a framework`, () => {
      expect(mergedPageRedirects).toContainEqual({
        source: `/components/${slug}`,
        destination: `/components/${target}`,
        permanent: true,
      })
      expect(mergedPageRedirects).toContainEqual({
        source: `/components/:framework/${slug}`,
        destination: `/components/:framework/${target}`,
        permanent: true,
      })
    })
  }
})
