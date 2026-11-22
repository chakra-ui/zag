import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / controlled ignore", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/controlled-ignore")
  })

  test("should keep selectedItems aligned with controlled value", async () => {
    await I.clickTrigger()
    await I.clickItem("Vue")

    await I.seeSelectedText("React")
    await I.dontSeeSelectedText("Vue")
  })
})
