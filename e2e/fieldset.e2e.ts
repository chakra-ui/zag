import { test } from "./_test"
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
    await I.seeOptionsDescribedByError("Contact details", true)

    await I.toggleOption("Invalid")
    await I.dontSeeError()
  })
})

test.describe("fieldset / groups", () => {
  test.beforeEach(async ({ page }) => {
    I = new FieldsetModel(page)
    await I.goto("groups")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("blocked submit marks the groups invalid and describes every option", async () => {
    await I.seeOptionsDescribedByError("Plan", false)

    await I.clickButton("Save")
    await I.seeFieldsetInvalid("Plan", true)
    await I.seeFieldsetInvalid("Notify me by", true)
    await I.seeOptionsDescribedByError("Plan", true)
    await I.seeOptionsDescribedByError("Notify me by", true)
    await I.seeFocusedOption("Free")
  })

  test("choosing an option clears only its group", async () => {
    await I.clickButton("Save")
    await I.clickOption("Pro")

    await I.seeFieldsetInvalid("Plan", false)
    await I.seeOptionsDescribedByError("Plan", false)
    await I.seeFieldsetInvalid("Notify me by", true)
  })
})

test.describe("fieldset / nested", () => {
  test.beforeEach(async ({ page }) => {
    I = new FieldsetModel(page)
    await I.goto("nested")
  })

  test("outer disabled cascades through the inner fieldset", async () => {
    await I.toggleOption("Disable shipping")
    await I.seeInputDisabled("recipient", true)
    await I.seeInputDisabled("street", true)
    await I.seeCheckboxDisabled(true)

    await I.toggleOption("Disable shipping")
    await I.seeInputDisabled("recipient", false)
    await I.seeInputDisabled("street", false)
    await I.seeCheckboxDisabled(false)
  })

  test("inner disabled only affects its own fields", async () => {
    await I.toggleOption("Disable address")
    await I.seeInputDisabled("recipient", false)
    await I.seeInputDisabled("street", true)
    await I.seeCheckboxDisabled(true)

    await I.toggleOption("Disable shipping")
    await I.toggleOption("Disable address")
    await I.seeInputDisabled("street", true)

    await I.toggleOption("Disable shipping")
    await I.seeInputDisabled("street", false)
    await I.seeCheckboxDisabled(false)
  })
})
