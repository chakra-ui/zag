import { test } from "./_test"
import { AvatarModel } from "./models/avatar.model"

let I: AvatarModel

test.describe("avatar", () => {
  test.beforeEach(async ({ page }) => {
    I = new AvatarModel(page)
    await I.goto("/avatar/basic")
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility(".avatar")
  })
})

test.describe("avatar load status", () => {
  test.beforeEach(async ({ page }) => {
    I = new AvatarModel(page)
  })

  test("should show the image once it loads", async () => {
    await I.goto()
    await I.seeStatus("loaded")
    await I.seeImage()
  })

  test("should show the fallback while the image loads", async () => {
    I.holdImage("women/44")
    await I.goto()
    await I.seeStatus("loading")
    await I.seeFallback()
  })

  test("should show the fallback when the image fails", async () => {
    await I.goto()
    await I.seeStatus("loaded")
    await I.click("Broken image")
    await I.seeStatus("error")
    await I.seeFallback()
  })

  test("should go back to loading when the source changes", async () => {
    I.holdImage("men/32")
    await I.goto()
    await I.seeStatus("loaded")
    await I.click("Next image")
    await I.seeStatus("loading")
    await I.seeFallback()
  })

  test("should track a source change after the image is remounted", async () => {
    I.holdImage("men/32")
    await I.goto()
    await I.seeStatus("loaded")

    // the old observer watched the first <img>, which is now gone
    await I.click("Toggle image")
    await I.click("Toggle image")
    await I.seeStatus("loaded")

    await I.click("Next image")
    await I.seeStatus("loading")
    await I.seeFallback()
  })

  test("should show the fallback when the image is removed", async () => {
    await I.goto()
    await I.seeStatus("loaded")
    await I.click("Toggle image")
    await I.seeStatus("error")
    await I.seeFallback()
  })

  test("should show the fallback when a wrapped image is removed", async () => {
    await I.goto()
    await I.click("Wrap in picture")
    await I.seeStatus("loaded")
    await I.seeImage()

    // the <picture> is removed, not the <img> itself
    await I.click("Toggle image")
    await I.seeStatus("error")
    await I.seeFallback()
  })

  test("should load an image added after the first one was removed", async () => {
    await I.goto()
    await I.click("Toggle image")
    await I.seeStatus("error")
    await I.click("Toggle image")
    await I.seeStatus("loaded")
    await I.seeImage()
  })

  test("should report loading, then the result, when the source changes", async () => {
    await I.goto()
    await I.seeStatus("loaded")
    await I.click("Broken image")
    await I.seeStatus("error")
    await I.seeLatestStatusReports("loading", "error")

    await I.click("Next image")
    await I.seeStatus("loaded")
    await I.seeLatestStatusReports("loading", "loaded")
  })
})
