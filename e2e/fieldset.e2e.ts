import { test } from "@playwright/test"
import { FieldsetModel } from "./models/fieldset.model"

let I: FieldsetModel

test.describe("fieldset", () => {
  test.beforeEach(async ({ page }) => {
    I = new FieldsetModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("legend labels the fieldset", async () => {
    await I.seeLegendLinked()
  })

  test("disabling the fieldset cascades to the field inside", async () => {
    await I.seeDisabled(false)
    await I.seeFieldInheritsDisabled(false)

    await I.toggleOption("Disabled")
    await I.seeDisabled(true)
    // DOM-based inheritance: the field machine picks it up from <fieldset disabled>
    await I.seeFieldInheritsDisabled(true)

    await I.toggleOption("Disabled")
    await I.seeDisabled(false)
    await I.seeFieldInheritsDisabled(false)
  })

  test("invalid shows the fieldset error without leaking into the field", async () => {
    await I.dontSeeError()
    await I.seeErrorDescribed(false)

    await I.toggleOption("Invalid")
    await I.seeError()
    await I.seeErrorDescribed(true)
    await I.seeFieldNotInvalid()

    await I.toggleOption("Invalid")
    await I.dontSeeError()
  })
})
