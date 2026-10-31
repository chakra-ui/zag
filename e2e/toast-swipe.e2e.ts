import { expect, test } from "./_test"
import { ToastModel } from "./models/toast.model"

let I: ToastModel

test.describe("toast / content", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("overlap")
  })

  test("marks the content of toasts behind the frontmost one", async () => {
    await I.clickExact("Show toast", 2)
    await expect(I.getContent(0)).toHaveAttribute("data-first", "")
    await expect(I.getContent(1)).toHaveAttribute("data-sibling", "")
    await expect(I.getContent(1)).toHaveAttribute("data-overlap", "")
  })

  test("reflects the expanded stack on the content", async () => {
    await I.clickExact("Show toast", 2)
    await I.mouseIntoRegion()
    await expect(I.getContent(1)).toHaveAttribute("data-stack", "")
  })
})

// Default directions for a bottom-end toaster: down and right
test.describe("toast / swipe / default directions", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("swipe")
    await I.clickExact("Default")
    await I.seeNumOfToasts(1)
  })

  test("swiping right past the threshold dismisses the toast", async () => {
    await I.swipe({ x: 80 })
    await I.seeSwipeDirection("right")
    await I.seeNumOfToasts(0)
  })

  test("swiping down past the threshold dismisses the toast", async () => {
    await I.swipe({ y: 80 })
    await I.seeSwipeDirection("down")
    await I.seeNumOfToasts(0)
  })

  test("a swipe below the threshold snaps back", async () => {
    await I.swipe({ x: 25 })
    await I.seeSwipeReset()
  })

  test("swiping in a direction that can't dismiss is damped and snaps back", async () => {
    await I.swipe({ x: -100 }, { release: false })
    const offset = await I.getSwipeOffset()
    expect(offset.x).toBeLessThan(0)
    expect(offset.x).toBeGreaterThan(-15)
    await I.page.mouse.up()
    await I.seeSwipeReset()
  })

  test("pulling back from the furthest point cancels the dismiss", async () => {
    await I.swipe({ x: 100 }, { back: 30 })
    await I.seeSwipeReset()
  })

  test("marks the toast as swiping only while dragging", async () => {
    await I.swipe({ x: 25 }, { release: false })
    await I.seeSwiping()
    await I.seeSwipeDirection("right")
    await I.page.mouse.up()
    await I.dontSeeSwiping()
  })

  test("resets after a far drag released outside the toast", async ({ page }) => {
    await I.swipe({ x: -2000 })
    await I.seeSwipeReset()

    await I.swipe({ x: 80 })
    await I.seeNumOfToasts(0)
    await expect(page.getByRole("status")).toHaveCount(0)
  })

  test("does not swipe with a non-primary button", async () => {
    await I.pressAndDragWithButton("middle", { x: 80 })
    await I.seeSwipeReset()
  })

  test("does not swipe from elements with data-swipe-ignore", async () => {
    await I.ignoreSwipeOnTitle()
    await I.swipeFromTitle({ x: 80 })
    await I.seeSwipeReset()
  })

  test("the close button still dismisses with a click", async () => {
    await I.clickNthCloseButton(0)
    await I.seeNumOfToasts(0)
  })

  test("pauses the toast while swiping", async () => {
    await I.swipe({ x: 25 }, { release: false })
    await expect(I.getToast()).toHaveAttribute("data-paused", "")
    await I.page.mouse.up()
  })
})

test.describe("toast / swipe / custom directions", () => {
  test.beforeEach(async ({ page }) => {
    I = new ToastModel(page)
    await I.goto("swipe")
  })

  test("only dismisses in the given direction", async () => {
    await I.clickExact("Right")
    await I.swipe({ y: 80 })
    await I.seeSwipeReset()

    await I.swipe({ x: 80 })
    await I.seeNumOfToasts(0)
  })

  test("up and right: swiping up dismisses", async () => {
    await I.clickExact("Up and right")
    await I.swipe({ y: -80 })
    await I.seeSwipeDirection("up")
    await I.seeNumOfToasts(0)
  })

  test("up and right: a sideways start locks the gesture horizontal", async () => {
    await I.clickExact("Up and right")
    await I.swipeTurning({ x: 10, y: -90 })
    await I.seeSwipeReset()
  })

  test("left and right: swiping left dismisses", async () => {
    await I.clickExact("Left and right")
    await I.swipe({ x: -80 })
    await I.seeSwipeDirection("left")
    await I.seeNumOfToasts(0)
  })

  test("left and right: pulling back still dismisses", async () => {
    await I.clickExact("Left and right")
    await I.swipe({ x: 100 }, { back: 30 })
    await I.seeNumOfToasts(0)
  })

  test("up and down: swiping down dismisses", async () => {
    await I.clickExact("Up and down")
    await I.swipe({ y: 80 })
    await I.seeSwipeDirection("down")
    await I.seeNumOfToasts(0)
  })

  test("an empty list turns swiping off", async () => {
    await I.clickExact("No swipe")
    await I.swipe({ x: 100 }, { release: false })
    await I.dontSeeSwiping()
    await I.page.mouse.up()
    await I.seeNumOfToasts(1)
  })
})
