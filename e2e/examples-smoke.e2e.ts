import { exampleRoutes } from "@zag-js/shared"
import { expect, test } from "@playwright/test"

for (const route of exampleRoutes) {
  test(`${route.path} loads without runtime errors`, async ({ page }) => {
    const errors: string[] = []

    page.on("pageerror", (error) => {
      errors.push(error.message)
    })

    const response = await page.goto(route.path)
    expect(response?.ok()).toBeTruthy()

    await page.waitForLoadState("networkidle")

    expect(errors, errors.join("\n")).toEqual([])
  })
}
