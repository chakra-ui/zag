import { expect, test as base } from "@playwright/test"

export { expect, type Page } from "@playwright/test"

// `page.goto` resolves on load, before the example has hydrated; wait for the app's ready marker
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page)
    page.goto = async (url, options) => {
      const response = await goto(url, options)
      await expect(page.locator("html[data-ready]"), "the example never became ready").toBeAttached()
      return response
    }
    await use(page)
  },
})
