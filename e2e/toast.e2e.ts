import { expect, test } from "@playwright/test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

test.describe("toast / stacked", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("stacked")
  })

  test("should pause on hover region", async () => {
    await I.clickErrorToast(3)

    await I.mouseIntoRegion()
    await I.seeToastArePaused()

    await I.mouseOutOfRegion()
    await I.seeNumOfToasts(0)
  })

  test("interacting with toast does not close dialog", async () => {
    if (process.env.FRAMEWORK !== "react") return
    await I.clickLoadingToast()
    await I.openDialog()
    await I.clickNthCloseButton(0)

    await I.seeDialog()
    await I.seeNumOfToasts(0)
  })
})

test.describe("toast / overlapping", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("overlap")
  })

  test("should render/remove error toast", async () => {
    await I.clickErrorToast()
    await I.seeToast("Ooops!")
    await I.seeNumOfToasts(0)
  })

  test("should overlap toasts by default", async () => {
    await I.clickErrorToast(3)
    await I.seeNumOfToasts(3)
    await I.seeToastsOverlap()
  })

  test("hover on region should expand region", async () => {
    await I.clickLoadingToast(3)

    await I.mouseIntoRegion()
    await I.seeToastsStacked()

    await I.mouseOutOfRegion()
    await I.seeToastsOverlap()
  })

  test("new toasts join the expanded stack without moving the pointer", async () => {
    await I.clickLoadingToast(2)
    await I.mouseIntoRegion()
    await I.seeToastsStacked()

    // The create button still has focus while the pointer stays over the stack.
    await I.page.keyboard.press("Space")
    await I.seeNumOfToasts(3)
    await I.seeToastsStacked()
    await I.seeToastArePaused()

    await I.mouseOutOfRegion()
    await I.seeToastsOverlap()
    await I.page.keyboard.press("Space")
    await I.seeNumOfToasts(4)
    await I.seeToastsOverlap()
  })

  test("toasts queued while expanded stay expanded when promoted", async () => {
    // Fill the store's default visible limit before expanding the stack.
    await I.clickLoadingToast(24)
    await I.seeNumOfToasts(24)
    await I.mouseIntoRegion()
    await I.seeToastsStacked()

    await I.page.keyboard.press("Space")
    const dismissedId = await I.page.getByRole("status").first().getAttribute("id")
    await I.clickNthCloseButton(0)
    await expect(I.page.locator(`[id="${dismissedId}"]`)).toHaveCount(0)

    await I.seeNumOfToasts(24)
    await I.seeToastsStacked()
    await I.seeToastArePaused()
  })

  test("focus on region on hotkey press", async () => {
    await I.clickErrorToast(2)
    await I.pressHotkey()

    await I.seeRegionIsFocused()
    await I.seeToastArePaused()
    await I.seeToastsStacked()

    await I.clickOutside()
    await I.seeToastsOverlap()
  })

  test("should pause all toast on click pause", async () => {
    await I.clickErrorToast(2)

    // pause
    await I.clickButton("Pause All")
    await I.seeToastArePaused()

    // resume
    await I.clickButton("Resume All")
    await I.seeNumOfToasts(0)
  })

  test("close all", async () => {
    await I.clickErrorToast(2)
    // pause to make it actually works
    await I.clickButton("Pause All")
    await I.clickButton("Close All")
    await I.seeNumOfToasts(0)
  })

  test("closing a toast should keep it expanded", async () => {
    await I.clickLoadingToast(4)

    await I.mouseIntoRegion()
    await I.hoverNthCloseButton(2)
    await I.clickNthCloseButton(2)

    await I.page.waitForTimeout(16)
    await I.seeToastsStacked()
  })
})
