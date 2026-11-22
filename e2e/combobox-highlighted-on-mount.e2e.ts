import { expect, test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / highlighted on mount", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/highlighted-on-mount")
  })

  test("does not scroll the document on mount", async ({ page }) => {
    await I.seeItemIsHighlighted("Zambia")
    await page.evaluate(
      () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        }),
    )
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    expect(await I.content.evaluate((el) => el.scrollTop)).toBe(0)
  })
})

// Grouped order: Fruit (Apple, Apricot, Banana, Cherry), Vegetable (Avocado, Asparagus, Broccoli, Carrot, Celery*)
