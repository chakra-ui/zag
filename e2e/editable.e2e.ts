import { test } from "@playwright/test"
import { EditableModel } from "./models/editable.model"
import { repeat } from "./_utils"

let I: EditableModel

test.describe("editable", () => {
  test.beforeEach(async ({ page }) => {
    I = new EditableModel(page)
    await I.goto()
  })

  test("should have no accessibility violation", async () => {
    await I.checkAccessibility()
  })

  test("on focus, input should be visible and focus", async () => {
    await I.focusPreview()
    await I.seeInput()
    await I.seeInputIsFocused()
  })

  test("on focus and blur, should retain current value", async () => {
    await I.focusPreview()
    await I.pressKey("Escape")
    await I.seeInputHasValue("Hello World")
  })

  test("on type, should commit input value", async () => {
    await I.focusPreview()

    await I.type("Naruto")
    await I.pressKey("Enter")

    await I.seePreviewHasText("Naruto")
    await I.dontSeeInput()
  })

  test("on type and esc, should revert value", async () => {
    await I.focusPreview()

    await I.type("Naruto")
    await I.pressKey("Escape")

    await I.seePreviewHasText("Hello World")
    await I.dontSeeInput()
  })

  test("on type and click submit, should commit value", async () => {
    await I.focusPreview()

    await I.type("Naruto")
    await I.clickSubmit()

    await I.seePreviewHasText("Naruto")
  })

  test("on type and click outside, should commit value", async () => {
    await I.focusPreview()

    await I.type("Naruto")
    await I.clickOutside()

    await I.seePreviewHasText("Naruto")
  })

  test("[maxLength=4] should respect maxLength", async () => {
    await I.controls.num("maxLength", "4")
    await I.focusPreview()

    await I.typeSequentially("Naruto")
    // hit maxLength
    await I.seeInputHasValue("Naru")

    // can still edit the value
    await I.pressKey("Backspace")
    await I.type("o")
    await I.seeInputHasValue("Naro")
  })

  test("[activationMode=dblclick] on focus and blur, should retain current value", async () => {
    await I.controls.select("activationMode", "dblclick")
    await I.dblClickPreview()
    await I.pressKey("Escape")
    await I.seePreviewHasText("Hello World")
  })

  test("on click edit, should enter edit mode", async () => {
    await I.clickEdit()
    await I.seeInput()
    await I.seeInputIsFocused()
  })

  test("revert value after repeated full deletion", async () => {
    await repeat(3, async () => {
      await I.focusPreview()
      await I.seeInputHasValue("Hello World")
      await I.pressKey("Backspace")
      await I.clickCancel()
      await I.seePreviewHasText("Hello World")
    })
  })
})
