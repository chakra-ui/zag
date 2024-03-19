import { expect, test } from "@playwright/test"
import { TagsInputModel } from "./models/tags-input.model"

let user: TagsInputModel

test.describe("tags-input", () => {
  test.beforeEach(async ({ page }) => {
    user = new TagsInputModel(page)
    await user.goto()
  })

  test("should add new tag value", async () => {
    await user.addTag("Svelte")
    await user.expectTagToBeVisible("Svelte")
    await expect(user.input).toBeEmpty()
    await expect(user.input).toBeFocused()
  })

  test("when input is empty backspace highlights the last tag", async () => {
    await user.input.focus()
    await user.backspace()
    await user.expectTagToBeHighlighted("Vue")
  })

  test("deletes tag with backspace when input value is empty", async () => {
    await user.addTag("Svelte")

    await user.backspace()
    await user.expectTagToBeHighlighted("Svelte")

    await user.backspace()
    await user.expectTagToBeRemoved("Svelte")

    await user.expectInputToBeFocused()
  })

  test("when tag is empty + no visible tags + enter pressed, should not enter editing state", async ({ page }) => {
    await user.input.focus()

    await user.deleteLastTag()
    await user.deleteLastTag()

    await page.keyboard.press("Enter")

    await user.addTag("Svelte")
    await user.expectTagToBeVisible("Svelte")

    await user.expectInputToBeEmpty()
    await user.expectInputToBeFocused()
  })

  test("should navigate tags with arrow keys", async () => {
    await user.addTag("Svelte")
    await user.addTag("Solid")

    await user.arrowLeft()
    await user.expectTagToBeHighlighted("Solid")

    await user.arrowLeft(2)
    await user.expectTagToBeHighlighted("Vue")

    await user.arrowRight()
    await user.expectTagToBeHighlighted("Svelte")
  })

  test("should clear focused tag on blur", async () => {
    await user.addTag("Svelte")
    await user.addTag("Solid")

    await user.arrowLeft()
    await user.clickOutside()

    await user.expectNoTagToBeHighlighted()
  })

  test("removes tag on close button click", async () => {
    await user.clickTagClose("Vue")
    await user.expectTagToBeRemoved("Vue")
    await user.expectInputToBeFocused()
  })

  test("edit tag with enter key", async ({ page }) => {
    await user.addTag("Svelte")
    await user.addTag("Solid")
    await user.arrowLeft(2)

    await page.keyboard.press("Enter")

    await user.expectTagInputToBeFocused("Svelte")
    await user.editTag("Jenkins")

    await user.expectTagToBeVisible("Jenkins")
    await user.expectTagInputToBeHidden("Jenkins")

    await user.expectInputToBeFocused()
  })

  test("edit with double click", async () => {
    await user.addTag("Svelte")
    await user.dblClick("Svelte")

    await user.expectTagInputToBeFocused("Svelte")
    await user.editTag("Jenkins")

    await user.expectTagToBeVisible("Jenkins")
    await user.expectTagInputToBeHidden("Jenkins")
  })

  test("clears highlighted tag on escape press", async ({ page }) => {
    await user.addTag("Svelte")
    await user.arrowLeft()
    await page.keyboard.press("Escape")
    await user.expectNoTagToBeHighlighted()
  })

  test("[addOnPaste: false] pasting + enter should work", async ({ page }) => {
    await user.paste("Svelte")
    await page.keyboard.press("Enter")
    await user.expectTagToBeVisible("Svelte")
  })

  test("[addOnPaste: true] pasting shoule add tags", async () => {
    await user.controls.bool("addOnPaste", true)
    await user.paste("Github, Jenkins")
    await user.expectTagToBeVisible("Github")
    await user.expectTagToBeVisible("Jenkins")
  })

  test("[addOnPaste: true] when input is empty, should work", async () => {
    await user.controls.bool("addOnPaste", true)
    // clear input
    await user.deleteLastTag()
    await user.deleteLastTag()

    // paste
    await user.paste("Github")
    await user.expectTagToBeVisible("Github")
  })
})
