import { test } from "@playwright/test"
import { TagsInputModel } from "./models/tags-input.model"

let I: TagsInputModel

test.describe("tags-input", () => {
  test.beforeEach(async ({ page }) => {
    I = new TagsInputModel(page)
    await I.goto()
  })

  test("should add new tag value", async () => {
    await I.addTag("Svelte")
    await I.seeTag("Svelte")
    await I.seeInputHasValue("")
    await I.seeInputIsFocused()
  })

  test("when input is empty backspace highlights the last tag", async () => {
    await I.focusInput()
    await I.pressKey("Backspace")
    await I.seeTagIsHighlighted("Vue")
  })

  test("deletes tag with backspace when input value is empty", async () => {
    await I.addTag("Svelte")

    await I.pressKey("Backspace")
    await I.seeTagIsHighlighted("Svelte")

    await I.pressKey("Backspace")
    await I.dontSeeTag("Svelte")

    await I.seeInputIsFocused()
  })

  test("delete tag by clearing its content and hit enter", async () => {
    await I.focusInput()
    await I.pressKey("ArrowLeft")
    await I.pressKey("Enter")

    await I.pressKey("Backspace")
    await I.pressKey("Enter")

    await I.seeInputIsFocused()
    await I.dontSeeTag("Vue")
  })

  test("delete tag with pointer, show allow keyboard navigation", async () => {
    await I.clickTagClose("Vue")

    await I.seeInputIsFocused()
    await I.dontSeeTag("Vue")

    await I.pressKey("ArrowLeft")
    await I.seeTagIsHighlighted("React")
  })

  test("when tag is empty + no visible tags + enter pressed, should not enter editing state", async () => {
    await I.focusInput()

    await I.deleteLastTag()
    await I.deleteLastTag()

    await I.pressKey("Enter")

    await I.addTag("Svelte")
    await I.seeTag("Svelte")

    await I.seeInputHasValue("")
    await I.seeInputIsFocused()
  })

  test("should navigate tags with arrow keys", async () => {
    await I.addTag("Svelte")
    await I.addTag("Solid")

    await I.pressKey("ArrowLeft")
    await I.seeTagIsHighlighted("Solid")

    await I.pressKey("ArrowLeft", 2)
    await I.seeTagIsHighlighted("Vue")

    await I.pressKey("ArrowRight")
    await I.seeTagIsHighlighted("Svelte")
  })

  test("should clear focused tag on blur", async () => {
    await I.addTag("Svelte")
    await I.addTag("Solid")

    await I.pressKey("ArrowLeft")
    await I.clickOutside()

    await I.expectNoTagToBeHighlighted()
  })

  test("removes tag on close button click", async () => {
    await I.clickTagClose("Vue")
    await I.dontSeeTag("Vue")
    await I.seeInputIsFocused()
  })

  test("edit tag with enter key", async () => {
    await I.addTag("Svelte")
    await I.addTag("Solid")
    await I.pressKey("ArrowLeft", 2)

    await I.pressKey("Enter")

    await I.seeTagInputIsFocused("Svelte")
    await I.editTag("Jenkins")

    await I.seeTag("Jenkins")
    await I.dontSeeTagInput("Jenkins")

    await I.seeInputIsFocused()
  })

  test("edit with double click", async () => {
    await I.addTag("Svelte")
    await I.doubleClickTag("Svelte")

    await I.seeTagInputIsFocused("Svelte")
    await I.editTag("Jenkins")

    await I.seeTag("Jenkins")
    await I.dontSeeTagInput("Jenkins")
  })

  test("clears highlighted tag on escape press", async () => {
    await I.addTag("Svelte")
    await I.pressKey("ArrowLeft")
    await I.pressKey("Escape")
    await I.expectNoTagToBeHighlighted()
  })

  test("[addOnPaste: false] pasting should work everytime", async () => {
    await I.paste("Svelte")
    await I.seeInputHasValue("Svelte")

    await I.pressKey("Enter")
    await I.seeTag("Svelte")

    await I.pressKey("Backspace", 2)

    await I.paste("Svelte")
    await I.seeInputHasValue("Svelte")

    await I.pressKey("Enter")
    await I.seeTag("Svelte")
  })

  test("[addOnPaste: false] pasting + enter should work", async () => {
    await I.paste("Svelte")
    await I.pressKey("Enter")
    await I.seeTag("Svelte")
  })

  test("[addOnPaste: true] pasting shoule add tags", async () => {
    await I.controls.bool("addOnPaste", true)

    await I.paste("Github, Jenkins")
    await I.seeTag("Github")
    await I.seeTag("Jenkins")
  })

  test("[addOnPaste: true] when input is empty, should work", async () => {
    await I.controls.bool("addOnPaste", true)

    // clear input
    await I.deleteLastTag()
    await I.deleteLastTag()

    // paste
    await I.paste("Github")
    await I.seeTag("Github")
  })
})
