import { expect, test } from "./_test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

test.describe("toast / basic", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("basic")
  })

  test("renders a status with title and description", async () => {
    await I.clickExact("Show toast")
    await I.seeNumOfToasts(1)
    await I.seeAccessibleName("Event created")
    await I.seeAccessibleDescription("Sunday, December 3 at 9:00 AM")
  })

  test("sets the type", async () => {
    for (const type of ["success", "error", "warning", "info", "loading"]) {
      await I.clickExact(type[0].toUpperCase() + type.slice(1))
      await I.seeToastType(type)
    }
  })

  test("close button removes the toast", async () => {
    await I.clickExact("Loading")
    await I.clickNthCloseButton(0)
    await I.seeNumOfToasts(0)
  })

  test("escape dismisses the focused toast", async ({ page }) => {
    await I.clickExact("Loading")
    await I.getToast().focus()
    await page.keyboard.press("Escape")
    await I.seeNumOfToasts(0)
  })

  test("updates the height when the content wraps onto more lines", async () => {
    await I.clickExact("Show toast")
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(0)
    const initialHeight = await I.getToastHeight()

    await I.resizeWindow({ width: 200, height: 720 })
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(initialHeight)
  })

  // Shows the toast first: at 200px the example's toolbar covers the trigger
  test("updates the height when the content wraps onto fewer lines", async () => {
    await I.clickExact("Show toast")
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(0)
    const baseHeight = await I.getToastHeight()

    await I.resizeWindow({ width: 200, height: 720 })
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(baseHeight)
    const wrappedHeight = await I.getToastHeight()

    await I.resizeWindow({ width: 1024, height: 720 })
    await expect.poll(() => I.getToastHeight()).toBeLessThan(wrappedHeight)
  })

  test("updates the height when the content grows without a resize", async () => {
    await I.clickExact("Show toast")
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(0)
    const initialHeight = await I.getToastHeight()

    await I.enlargeTitle()
    await expect.poll(() => I.getToastHeight()).toBeGreaterThan(initialHeight)
  })
})

test.describe("toast / overlap", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("overlap")
  })

  test("overlaps toasts by default", async () => {
    await I.clickExact("Show toast", 3)
    await I.seeNumOfToasts(3)
    await I.seeToastsOverlap()
  })

  test("hover expands the stack and pauses", async () => {
    await I.clickExact("Show toast", 3)

    await I.mouseIntoRegion()
    await I.seeToastsStacked()
    await I.seeToastArePaused()

    await I.mouseOutOfRegion()
    await I.seeToastsOverlap()
  })

  test("hotkey focuses the region", async () => {
    await I.clickExact("Show toast", 2)
    await I.pressHotkey()

    await I.seeRegionIsFocused()
    await I.seeToastArePaused()
    await I.seeToastsStacked()

    await I.clickOutside()
    await I.seeToastsOverlap()
  })

  test("closing a toast keeps the stack expanded", async ({ page }) => {
    await I.clickExact("Show toast", 4)

    await I.mouseIntoRegion()
    await I.hoverNthCloseButton(2)
    await I.clickNthCloseButton(2)

    await page.waitForTimeout(16)
    await I.seeToastsStacked()
  })

  test("new toasts join the expanded stack without moving the pointer", async ({ page }) => {
    await I.clickExact("Show toast", 2)
    await I.mouseIntoRegion()
    await I.seeToastsStacked()

    // The create button keeps focus while the pointer stays over the stack
    await page.keyboard.press("Space")
    await I.seeNumOfToasts(3)
    await I.seeToastsStacked()
    await I.seeToastArePaused()

    await I.mouseOutOfRegion()
    await I.seeToastsOverlap()
    await page.keyboard.press("Space")
    await I.seeNumOfToasts(4)
    await I.seeToastsOverlap()
  })

  test("closing a toast with the mouse resumes the rest once the pointer leaves", async () => {
    await I.clickExact("Show toast", 2)
    await I.closeNthToast(0)
    await I.seeNumOfToasts(1)

    await I.mouseOutOfRegion()
    await I.seeToastsAreNotPaused()
  })
})

test.describe("toast / list", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("list")
  })

  test("lays toasts out without overlap", async () => {
    await I.clickExact("Show toast", 3)
    await I.seeToastsStacked()
    await I.seeToastsDontOverlap(3)
  })

  test("pauses on hover and resumes on leave", async () => {
    await I.clickExact("Show toast")
    await I.mouseIntoRegion()
    await I.seeToastArePaused()

    await I.mouseOutOfRegion()
    await I.seeNumOfToasts(0)
  })

  test("escape on a focused toast moves focus to the next toast", async () => {
    await I.clickExact("Show toast", 2)
    await I.pressHotkey()
    await I.pressKey("Tab")
    await I.seeToastArePaused()

    await I.pressKey("Escape")
    await I.seeNumOfToasts(1)
    await I.seeToastIsFocused(0)
    await I.seeToastArePaused()

    await I.pressKey("Escape")
    await I.seeNumOfToasts(0)
    await I.seeButtonIsFocused("Show toast")
  })

  test("closing a focused toast with its close button moves focus to the next toast", async () => {
    await I.clickExact("Show toast", 2)
    await I.pressHotkey()
    await I.pressKey("Tab")
    await I.pressKey("Tab")

    await I.pressKey("Enter")
    await I.seeNumOfToasts(1)
    await I.seeToastIsFocused(0)
  })

  test("closing a toast with the mouse resumes the others once the pointer leaves", async () => {
    await I.clickExact("Show toast", 2)
    await I.closeNthToast(0)
    await I.seeNumOfToasts(1)

    await I.mouseOutOfRegion()
    await I.seeToastsAreNotPaused()
  })
})

test.describe("toast / duration", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("duration")
  })

  test("auto-dismisses after its duration", async () => {
    await I.clickExact("2 seconds")
    await I.seeNumOfToasts(1)
    await expect(I.page.getByRole("status")).toHaveCount(0, { timeout: 4000 })
  })

  test("persistent toast stays", async ({ page }) => {
    await I.clickExact("Persistent")
    await page.waitForTimeout(3000)
    await I.seeNumOfToasts(1)
  })
})

test.describe("toast / placement", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("placement")
  })

  test("renders each toast in its placement", async ({ page }) => {
    const viewport = page.viewportSize()!

    for (const placement of ["top-start", "top-end", "bottom-start", "bottom-end"]) {
      await I.clickExact(placement)
      const toast = page.locator(`[data-toast-root][data-placement="${placement}"]`)
      await expect(toast).toBeVisible()

      const box = (await toast.boundingBox())!
      const [side, align] = placement.split("-")
      expect(box.y < viewport.height / 2).toBe(side === "top")
      expect(box.x < viewport.width / 2).toBe(align === "start")
    }
  })
})

test.describe("toast / action", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("action")
  })

  test("runs the action and dismisses the toast", async ({ page }) => {
    await I.clickExact("Remove bookmark")
    await expect(page.getByText("Removed from reading list")).toBeVisible()

    await I.clickAction("Undo")
    await expect(page.getByText("Saved to reading list")).toBeVisible()
    await I.seeNumOfToasts(0)
  })
})

test.describe("toast / promise", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("promise")
  })

  test("resolves the loading toast in place", async () => {
    await I.clickExact("Upload")
    await I.seeToastType("loading")
    await I.seeToastText(["Uploading photo"])

    await I.seeToastType("success")
    await I.seeToastText(["Upload complete"])
  })

  test("rejects the loading toast in place", async () => {
    await I.clickExact("Fail upload")
    await I.seeToastType("loading")

    await I.seeToastType("error")
    await I.seeToastText(["Upload failed"])
  })

  test("keeps updates made while loading", async () => {
    await I.clickExact("Upload with message")
    await I.seeToastText(["Sending photo.png"])

    await I.seeToastType("success")
    await I.seeToastText(["photo.png is ready"])
  })
})

test.describe("toast / update", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("update")
  })

  test("updates one toast instead of stacking", async () => {
    await I.clickExact("Save draft", 3)
    await I.seeToastText(["Saved 3 times"])

    await I.clickExact("Dismiss")
    await I.seeNumOfToasts(0)

    await I.clickExact("Save draft")
    await I.seeToastText(["Saved 1 time"])
  })
})

test.describe("toast / max", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("max")
  })

  test("queues toasts past the limit with their latest update", async () => {
    await I.clickExact("Create three toasts")
    await I.seeToastText(["Toast 2", "Toast 1"])

    await I.clickExact("Update waiting toast")
    await I.clickExact("Dismiss oldest")
    await I.seeToastText(["updated 2 times", "Toast 2"])
  })

  test("dismissing a queued toast cancels it", async () => {
    await I.clickExact("Create three toasts")
    await I.clickExact("Dismiss waiting toast")
    await I.clickExact("Dismiss oldest")
    await I.seeToastText(["Toast 2"])
  })
})

test.describe("toast / programmatic", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("programmatic")
  })

  test("pauses and resumes all toasts", async () => {
    await I.clickExact("Show toast", 2)

    await I.clickExact("Pause all")
    await I.seeToastArePaused()

    await I.clickExact("Resume all")
    await I.seeNumOfToasts(0)
  })

  test("dismisses all toasts", async () => {
    await I.clickExact("Show toast", 2)
    await I.clickExact("Pause all")
    await I.clickExact("Dismiss all")
    await I.seeNumOfToasts(0)
  })
})

test.describe("toast / with dialog", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("with-dialog")
  })

  test("interacting with a toast does not close the dialog", async () => {
    await I.clickExact("Edit profile")
    await I.clickExact("Save")
    await I.seeNumOfToasts(1)

    await I.clickNthCloseButton(0)
    await I.seeDialog()
    await I.seeNumOfToasts(0)
  })
})
