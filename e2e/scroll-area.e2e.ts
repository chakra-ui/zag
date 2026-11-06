import { expect, test } from "./_test"
import { ScrollAreaModel } from "./models/scroll-area.model"

let I: ScrollAreaModel

test.beforeEach(async ({ page }) => {
  I = new ScrollAreaModel(page)
})

test("dragging the vertical thumb only marks the vertical axis", async () => {
  await I.goto()
  await I.startThumbDrag()

  await expect(I.thumb("vertical")).toHaveAttribute("data-dragging", "")
  await expect(I.scrollbar("vertical")).toHaveAttribute("data-dragging", "")
  await expect(I.thumb("horizontal")).not.toHaveAttribute("data-dragging")
  await expect(I.scrollbar("horizontal")).not.toHaveAttribute("data-dragging")
})

test("should hide the scrollbars from assistive technology", async () => {
  await I.goto()
  await expect(I.scrollbar()).toHaveAttribute("aria-hidden", "true")
  await expect(I.viewport).not.toHaveAttribute("role")
})

test("should turn off scroll snapping while the thumb is dragged", async ({ page }) => {
  await I.goto()
  await I.viewport.evaluate((el) => (el.style.scrollSnapType = "y mandatory"))

  await I.startThumbDrag()
  await I.seeScrollSnap("none")

  await page.mouse.up()
  await I.seeScrollSnap("y mandatory")
})

test.describe("content that grows", () => {
  test.beforeEach(async () => {
    await I.goto("/scroll-area/dynamic")
  })

  test("should not report overflow before the content overflows", async () => {
    await expect(I.viewport).not.toHaveAttribute("data-overflow-y")
    await expect(I.scrollbar()).toHaveCount(0)
    await expect(I.viewport).not.toHaveAttribute("tabindex")
  })

  test("should make a vertical-only area focusable", async () => {
    await I.clickButton("Add rows")
    await expect(I.viewport).toHaveAttribute("tabindex", "0")
  })

  test("should scroll when wheeling over a scrollbar that appeared later", async () => {
    await I.clickButton("Add rows")
    await I.wheelOver(I.scrollbar())
    await I.seeScrolled()
  })

  test("should keep focus on the viewport when the scrollbar is pressed", async () => {
    await I.clickButton("Add rows")
    await I.viewport.focus()
    await I.pressScrollbarTrack()
    await expect(I.viewport).toBeFocused()
  })

  test("should mark scrolling when the user scrolls", async () => {
    await I.clickButton("Add rows")
    await I.wheelOver(I.viewport)
    await expect(I.scrollbar()).toHaveAttribute("data-scrolling", "")
  })

  test("should not mark scrolling for a scroll made in code", async () => {
    await I.clickButton("Add rows")
    await I.moveAway()
    await I.watchScrolling()
    await I.clickButton("Scroll to bottom")
    await I.seeScrolled()
    await I.seeMarkedScrolling(false)
  })
})

test.describe("scrolling state", () => {
  test.beforeEach(async () => {
    await I.goto()
  })

  test("should only mark the axis being scrolled", async () => {
    await I.wheelOver(I.viewport)
    await expect(I.scrollbar("vertical")).toHaveAttribute("data-scrolling", "")
    await expect(I.scrollbar("horizontal")).not.toHaveAttribute("data-scrolling")
  })

  test("should clear the scrolling mark once scrolling stops", async () => {
    await I.wheelOver(I.viewport)
    await expect(I.scrollbar()).toHaveAttribute("data-scrolling", "")
    await expect(I.scrollbar()).not.toHaveAttribute("data-scrolling")
  })
})

test.describe("overflow", () => {
  test("should clear overflow once the content stops overflowing", async () => {
    await I.goto("/scroll-area/dynamic")
    await I.clickButton("Add rows")
    await expect(I.viewport).toHaveAttribute("data-overflow-y", "")

    await I.clickButton("Remove rows")
    await expect(I.viewport).not.toHaveAttribute("data-overflow-y")
    await expect(I.scrollbar()).toHaveCount(0)
    await expect(I.viewport).not.toHaveAttribute("tabindex")
  })

  test("should mark the edges the content is scrolled to", async () => {
    await I.goto()
    await expect(I.viewport).toHaveAttribute("data-at-top", "")
    await expect(I.viewport).not.toHaveAttribute("data-at-bottom")

    await I.clickButton("Scroll to bottom")
    await expect(I.viewport).toHaveAttribute("data-at-bottom", "")
    await expect(I.viewport).not.toHaveAttribute("data-at-top")
  })

  test("should size the thumb to the visible share of the content", async () => {
    await I.goto()
    const expected = await I.page.evaluate(() => {
      const vp = document.querySelector<HTMLElement>("[data-scroll-area-viewport]")!
      const track = document.querySelector<HTMLElement>("[data-scroll-area-scrollbar][data-orientation=vertical]")!
      return Math.max(16, track.clientHeight * (vp.clientHeight / vp.scrollHeight))
    })
    const box = await I.thumb().boundingBox()
    expect(Math.abs(box!.height - expected)).toBeLessThan(2)
  })
})

test.describe("track", () => {
  test.beforeEach(async () => {
    await I.goto()
  })

  test("should jump to where the track is pressed", async () => {
    await I.pressTrackAt(0.8)
    const max = await I.maxScrollTop()
    await expect.poll(() => I.scrollTop()).toBeGreaterThan(max * 0.6)

    await I.pressTrackAt(0.05)
    await expect.poll(() => I.scrollTop()).toBeLessThan(max * 0.2)
  })

  test("should ignore a press with another mouse button", async () => {
    await I.pressTrackAt(0.8, "right")
    expect(await I.scrollTop()).toBe(0)
  })

  test("should mark scrolling when the track is pressed", async () => {
    await I.pressTrackAt(0.8)
    await expect(I.scrollbar()).toHaveAttribute("data-scrolling", "")
  })
})

test.describe("wheel over the scrollbar", () => {
  test.beforeEach(async () => {
    await I.goto()
  })

  test("should scroll the viewport and keep the page still", async () => {
    expect(await I.wheelOverScrollbar(100)).toBe(true)
    await I.seeScrolled()
  })

  test("should let the page scroll once the viewport is at its edge", async () => {
    expect(await I.wheelOverScrollbar(-100)).toBe(false)
    expect(await I.scrollTop()).toBe(0)
  })

  test("should leave a pinch-zoom gesture alone", async () => {
    expect(await I.wheelOverScrollbar(100, { ctrl: true })).toBe(false)
    expect(await I.scrollTop()).toBe(0)
  })
})

test.describe("thumb", () => {
  test.beforeEach(async () => {
    await I.goto()
  })

  test("should scroll horizontally when the thumb is dragged", async () => {
    await I.dragHorizontalThumb(60)
    await expect.poll(() => I.scrollLeft()).toBeGreaterThan(0)
  })

  test("should scroll horizontally in right-to-left layouts", async () => {
    await I.controls.select("dir", "rtl")
    await I.dragHorizontalThumb(-60)
    await expect.poll(() => I.scrollLeft()).toBeLessThan(0)
  })

  test("should end the drag when the release was missed", async () => {
    await I.startThumbDrag()
    await expect(I.thumb()).toHaveAttribute("data-dragging", "")

    await I.moveWithoutButton()
    await expect(I.thumb()).not.toHaveAttribute("data-dragging")
  })
})
