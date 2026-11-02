import { expect, test, type Page } from "./_test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

function showTitle(page: Page, show: boolean) {
  return page.getByLabel("Show title").setChecked(show)
}

function showDescription(page: Page, show: boolean) {
  return page.getByLabel("Show description").setChecked(show)
}

test.describe("toast / conditional content", () => {
  test.skip(process.env.FRAMEWORK === "preact", "This example is available in React, Solid, Vue, and Svelte")

  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("conditional-content")
    await expect(page.getByRole("button", { name: "Create toast" })).toBeEnabled()
  })

  test("omits both references when neither title nor description renders", async () => {
    await I.clickButton("Create toast")

    await I.seeToast("Your draft is ready.")
    await I.dontSeeTitle()
    await I.dontSeeDescription()
    await I.seeAccessibleName("")
    await I.seeAccessibleDescription("")
  })

  test("omits the title reference when only the description renders", async ({ page }) => {
    await showDescription(page, true)
    await I.clickButton("Create toast")

    await I.dontSeeTitle()
    await I.seeAccessibleName("")
    await I.seeAccessibleDescription("All changes are up to date.")
  })

  test("omits the description reference when only the title renders", async ({ page }) => {
    await showTitle(page, true)
    await I.clickButton("Create toast")

    await I.seeAccessibleName("Draft saved")
    await I.dontSeeDescription()
    await I.seeAccessibleDescription("")
  })

  test("references both parts when both render", async ({ page }) => {
    await showTitle(page, true)
    await showDescription(page, true)
    await I.clickButton("Create toast")

    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")
  })

  test("updates the toast height when optional content mounts and unmounts", async ({ page }) => {
    await I.clickButton("Create toast")
    await I.seeToast("Your draft is ready.")
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(0)
    const initialHeight = await I.getToastHeight()

    await showTitle(page, true)
    await showDescription(page, true)
    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(initialHeight)

    await showTitle(page, false)
    await showDescription(page, false)
    await I.dontSeeTitle()
    await I.dontSeeDescription()
    await expect.poll(() => I.getToastHeight()).toBeCloseTo(initialHeight, 0)
  })

  test("updates the title reference when the title mounts, unmounts, and mounts again", async ({ page }) => {
    await showDescription(page, true)
    await I.clickButton("Create toast")

    await I.dontSeeTitle()
    await I.seeAccessibleName("")
    await I.seeAccessibleDescription("All changes are up to date.")

    await showTitle(page, true)
    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")

    await showTitle(page, false)
    await I.dontSeeTitle()
    await I.seeAccessibleName("")
    await I.seeAccessibleDescription("All changes are up to date.")

    await showTitle(page, true)
    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")
  })

  test("updates the description reference when the description mounts, unmounts, and mounts again", async ({
    page,
  }) => {
    await showTitle(page, true)
    await I.clickButton("Create toast")

    await I.seeAccessibleName("Draft saved")
    await I.dontSeeDescription()
    await I.seeAccessibleDescription("")

    await showDescription(page, true)
    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")

    await showDescription(page, false)
    await I.seeAccessibleName("Draft saved")
    await I.dontSeeDescription()
    await I.seeAccessibleDescription("")

    await showDescription(page, true)
    await I.seeAccessibleName("Draft saved")
    await I.seeAccessibleDescription("All changes are up to date.")
  })
})
