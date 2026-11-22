import { test } from "./_test"
import { ComboboxModel } from "./models/combobox.model"

let I: ComboboxModel

test.describe("combobox / controlled format", () => {
  test.beforeEach(async ({ page }) => {
    I = new ComboboxModel(page)
    await I.goto("/combobox/controlled-format")
  })

  test("removes rejected characters and keeps the caret", async () => {
    I.withLabel("Digits")
    await I.clickInput()
    await I.type("12x34")
    await I.seeInputHasValue("1234")

    await I.moveCaretTo(2)
    await I.type("y")
    await I.seeInputHasValue("1234")
    await I.seeCaretAt(2)
  })

  test("filters pasted text and places the caret after it", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    I.withLabel("Digits")
    await I.clickInput()
    await I.type("1234")
    await I.seeInputHasValue("1234")
    await I.moveCaretTo(2)
    await I.page.evaluate(() => navigator.clipboard.writeText("5z6"))
    await I.pressKey("ControlOrMeta+v")
    await I.seeInputHasValue("125634")
    await I.seeCaretAt(4)
  })

  test("keeps the caret when an edit is transformed", async () => {
    I.withLabel("Uppercase")
    await I.clickInput()
    await I.type("abc")
    await I.seeInputHasValue("ABC")

    await I.moveCaretTo(2)
    await I.type("q")
    await I.seeInputHasValue("ABQC")
    await I.seeCaretAt(3)
  })

  test("commits a composition once it ends", async () => {
    I.withLabel("Uppercase")
    await I.clickInput()
    await I.compose("a")
    await I.compose("ab")
    await I.seeDropdown()
    await I.seeInputHasValue("ab")

    await I.commitComposition("ab")
    await I.seeInputHasValue("AB")
    await I.seeCaretAt(2)
  })
})
