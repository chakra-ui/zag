import { expect, test, type Page } from "./_test"
import { RadioGroupModel } from "./models/radio-group.model"

let I: RadioGroupModel

function showLabel(page: Page, show: boolean) {
  return page.getByLabel("Show label").setChecked(show)
}

test.describe("radio group / conditional label", () => {
  test.skip(!!process.env.FRAMEWORK && process.env.FRAMEWORK !== "react", "React example")

  test.beforeEach(async ({ page }) => {
    I = new RadioGroupModel(page)
    await I.goto("/radio-group/conditional-label")
  })

  test("omits aria-labelledby when the label does not render", async () => {
    await expect(I.label).toHaveCount(0)
    await expect(I.root).not.toHaveAttribute("aria-labelledby")
    await expect(I.root).toHaveAccessibleName("Fruits")
  })

  test("updates aria-labelledby when the label mounts, unmounts, and mounts again", async ({ page }) => {
    await showLabel(page, true)
    await I.seeRootHasLabelledBy()
    await expect(I.root).toHaveAccessibleName("Favorite fruit")

    await showLabel(page, false)
    await expect(I.label).toHaveCount(0)
    await expect(I.root).not.toHaveAttribute("aria-labelledby")
    await expect(I.root).toHaveAccessibleName("Fruits")

    await showLabel(page, true)
    await I.seeRootHasLabelledBy()
    await expect(I.root).toHaveAccessibleName("Favorite fruit")
  })
})
