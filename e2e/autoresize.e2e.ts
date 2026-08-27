import { test } from "@playwright/test"
import { AutoresizeModel } from "./models/autoresize.model"

let I: AutoresizeModel

test.describe("autoresize / basic", () => {
  test.beforeEach(async ({ page }) => {
    I = new AutoresizeModel(page)
    await I.goto("/autoresize/basic")
  })

  test("should grow textarea height as content increases", async () => {
    const initialHeight = await I.getTextareaHeight()

    await I.typeInTextarea("line1\nline2\nline3\nline4\nline5\nline6")

    await I.seeTextareaGrew(initialHeight)
  })

  test("should grow textarea height when pasting multiline text", async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])

    const initialHeight = await I.getTextareaHeight()

    await I.pasteInTextarea("line1\nline2\nline3\nline4\nline5\nline6")

    await I.seeTextareaGrew(initialHeight)
  })
})

test.describe("autoresize / controlled", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    I = new AutoresizeModel(page)
    await I.goto("/autoresize/controlled")
  })

  test("should sync typed value to state", async () => {
    await I.typeInTextarea("hello")

    await I.seeTextareaHasValue("hello")
    await I.seeStateValue("hello")
  })

  test("should sync pasted value to state", async () => {
    await I.pasteInTextarea("pasted text")

    await I.seeTextareaHasValue("pasted text")
    await I.seeStateValue("pasted text")
  })

  test("should update value after clear and retype same character", async () => {
    await I.typeInTextarea("a")
    await I.seeStateValue("a")

    await I.clear()
    await I.seeTextareaHasValue("")
    await I.seeStateValue("")

    await I.typeInTextarea("a")

    await I.seeTextareaHasValue("a")
    await I.seeStateValue("a")
  })

  test("should update value after clear and paste same text", async () => {
    await I.pasteInTextarea("a")
    await I.seeStateValue("a")

    await I.clear()
    await I.seeTextareaHasValue("")
    await I.seeStateValue("")

    await I.pasteInTextarea("a")

    await I.seeTextareaHasValue("a")
    await I.seeStateValue("a")
  })
})
