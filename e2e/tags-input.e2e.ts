import { expect, test } from "@playwright/test"
import { TagsInputModel } from "./models/tags-input.model"

let I: TagsInputModel

test.describe("tags-input", () => {
  test.beforeEach(async ({ page }) => {
    I = new TagsInputModel(page)
    await I.goto()
  })

  test("should add new tag value", async () => {
    await I.addTag("Svelte")
    await I.expectTagToBeVisible("Svelte")
    await expect(I.input).toBeEmpty()
    await expect(I.input).toBeFocused()
  })

  test("when input is empty backspace highlights the last tag", async () => {
    await I.input.focus()
    await I.pressBackspace()
    await I.expectTagToBeHighlighted("Vue")
  })

  test("deletes tag with backspace when input value is empty", async () => {
    await I.addTag("Svelte")

    await I.pressBackspace()
    await I.expectTagToBeHighlighted("Svelte")

    await I.pressBackspace()
    await I.expectTagToBeRemoved("Svelte")

    await I.expectInputToBeFocused()
  })

  test("when tag is empty + no visible tags + enter pressed, should not enter editing state", async ({ page }) => {
    await I.input.focus()

    await I.deleteLastTag()
    await I.deleteLastTag()

    await page.keyboard.press("Enter")

    await I.addTag("Svelte")
    await I.expectTagToBeVisible("Svelte")

    await I.expectInputToBeEmpty()
    await I.expectInputToBeFocused()
  })

  test("should navigate tags with arrow keys", async () => {
    await I.addTag("Svelte")
    await I.addTag("Solid")

    await I.pressArrowLeft()
    await I.expectTagToBeHighlighted("Solid")

    await I.pressArrowLeft(2)
    await I.expectTagToBeHighlighted("Vue")

    await I.pressArrowRight()
    await I.expectTagToBeHighlighted("Svelte")
  })

  test("should clear focused tag on blur", async () => {
    await I.addTag("Svelte")
    await I.addTag("Solid")

    await I.pressArrowLeft()
    await I.clickOutside()

    await I.expectNoTagToBeHighlighted()
  })

  test("removes tag on close button click", async () => {
    await I.clickTagClose("Vue")
    await I.expectTagToBeRemoved("Vue")
    await I.expectInputToBeFocused()
  })

  test("edit tag with enter key", async ({ page }) => {
    await I.addTag("Svelte")
    await I.addTag("Solid")
    await I.pressArrowLeft(2)

    await page.keyboard.press("Enter")

    await I.expectTagInputToBeFocused("Svelte")
    await I.editTag("Jenkins")

    await I.expectTagToBeVisible("Jenkins")
    await I.expectTagInputToBeHidden("Jenkins")

    await I.expectInputToBeFocused()
  })

  test("edit with double click", async () => {
    await I.addTag("Svelte")
    await I.dblClick("Svelte")

    await I.expectTagInputToBeFocused("Svelte")
    await I.editTag("Jenkins")

    await I.expectTagToBeVisible("Jenkins")
    await I.expectTagInputToBeHidden("Jenkins")
  })

  test("clears highlighted tag on escape press", async ({ page }) => {
    await I.addTag("Svelte")
    await I.pressArrowLeft()
    await page.keyboard.press("Escape")
    await I.expectNoTagToBeHighlighted()
  })

  test("[addOnPaste: false] pasting + enter should work", async ({ page }) => {
    await I.paste("Svelte")
    await page.keyboard.press("Enter")
    await I.expectTagToBeVisible("Svelte")
  })

  test("[addOnPaste: true] pasting shoule add tags", async () => {
    await I.setContext.bool("addOnPaste", true)
    await I.paste("Github, Jenkins")
    await I.expectTagToBeVisible("Github")
    await I.expectTagToBeVisible("Jenkins")
  })

  test("[addOnPaste: true] when input is empty, should work", async () => {
    await I.setContext.bool("addOnPaste", true)
    // clear input
    await I.deleteLastTag()
    await I.deleteLastTag()

    // paste
    await I.paste("Github")
    await I.expectTagToBeVisible("Github")
  })
})
