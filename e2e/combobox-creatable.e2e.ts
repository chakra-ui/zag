import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / creatable", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/creatable")
  })

  test("offers to create an item that doesn't exist", async () => {
    await I.type("Perf")
    await I.seeItems(['Create "Perf"'])

    await I.clickItem('Create "Perf"')
    await I.seeInputHasValue("Perf")

    await I.clickTrigger()
    await I.seeItems(["Bug", "Feature", "Enhancement", "Documentation", "Perf"])
    await I.seeItemIsChecked("Perf")
  })

  test("doesn't offer to create an item that exists", async () => {
    await I.type("bug")
    await I.seeItems(["Bug"])
  })

  test("offers to create alongside partial matches", async () => {
    await I.type("Do")
    await I.seeItems(["Documentation", 'Create "Do"'])
  })
})
