import { expect, test } from "./_test"
import { SplitterModel } from "./models/splitter.model"

let I: SplitterModel

test.describe("splitter", () => {
  test.beforeEach(async ({ page }) => {
    I = new SplitterModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.checkAccessibility()
  })

  test("should move focus to the next handle with Tab", async () => {
    await I.focusHandle(0)
    await I.pressKey("Tab")
    await I.seeHandleIsFocused(1)
  })

  test("should grow the panel with ArrowRight", async () => {
    await I.focusHandle(1)
    await I.pressKey("ArrowRight", 3)
    await I.seeHandleValue(1, 36)
  })

  test("should shrink the panel with ArrowLeft", async () => {
    await I.focusHandle(1)
    await I.pressKey("ArrowLeft", 3)
    await I.seeHandleValue(1, 30)
  })

  test("should resize with the keyboard when focused after hover", async () => {
    await I.focusButtonBeforeSplitter()
    await I.hoverHandle(0)
    await I.pressKey("Tab")
    await I.seeHandleIsFocused(0)

    const value = await I.getHandleValue(0)
    await I.pressKey("ArrowRight")
    await I.seeHandleValue(0, value + 1)
  })

  test("should keep pointer focus without showing the focus ring", async () => {
    await I.drag(0, 20)
    await I.seeHandleIsFocused(0)
    await I.dontSeeFocusRing(0)

    const value = await I.getHandleValue(0)
    await I.pressKey("ArrowRight")
    await I.seeHandleValue(0, value + 1)
  })

  test("should expose the separator orientation, perpendicular to the panel layout", async () => {
    await I.seeHandleOrientation(0, "vertical")
    await I.controls.select("orientation", "vertical")
    await I.seeHandleOrientation(0, "horizontal")
  })

  test("should lay out vertically", async () => {
    await I.controls.select("orientation", "vertical")
    await I.seeLayoutOrientation("vertical")
  })
})

test.describe("splitter / nested", () => {
  test.beforeEach(async ({ page }) => {
    I = new SplitterModel(page)
    await I.goto("nested")
  })

  test("should keep the inner layout when the outer splitter resizes", async () => {
    const initial = await I.getHandleValue("top:middle")
    await I.dragVertically("top:middle", 40)
    const resized = await I.getHandleValue("top:middle")
    expect(resized).not.toBe(initial)

    await I.drag("left:center", 40)
    await I.seeHandleValue("top:middle", resized)
  })
})

test.describe("splitter / keyboard", () => {
  test.beforeEach(({ page }) => {
    I = new SplitterModel(page)
  })

  test("Home and End move the handle to its limits", async () => {
    await I.goto("events")
    await I.focusHandle(0)
    await I.pressKey("End")
    await I.seeHandleValue(0, 40)
    await I.pressKey("Home")
    await I.seeHandleValue(0, 5)
  })

  test("double-click resets the panel before the handle", async () => {
    await I.goto("basic")
    await I.focusHandle(0)
    await I.pressKey("ArrowRight", 2)
    await I.seeSizes([35, 31, 33])
    await I.doubleClickHandle(0)
    await I.seeSizes([33, 33, 33])
  })
})

test.describe("splitter / pointer", () => {
  test.beforeEach(({ page }) => {
    I = new SplitterModel(page)
  })

  test("the handle follows the pointer", async () => {
    await I.goto("basic")
    const startX = await I.handleX(0)
    await I.drag(0, 200)
    await I.seeHandleMovedBy(0, startX, 200)
  })

  test("the handle follows the pointer with fixed-size content beside it", async () => {
    await I.goto("fixed-size")
    const startX = await I.handleX(0)
    await I.drag(0, 120)
    await I.seeHandleMovedBy(0, startX, 120)
  })

  test("dragging right in RTL moves the handle right", async () => {
    await I.goto("basic")
    await I.controls.select("dir", "rtl")
    const startX = await I.handleX(0)
    await I.drag(0, 100)
    await I.seeHandleMovedBy(0, startX, 100)
  })

  test("stops at a panel's max and follows the pointer back", async () => {
    await I.goto("events")
    // A's max is 40%, so dragging far right stops there, then dragging back works in the same gesture
    await I.drag(0, -50, 600)
    await I.seeHandleValueBelow(0, 25)
  })

  test("takes space from the next panels once the neighbour reaches its min", async () => {
    await I.goto("events")
    await I.drag(1, -800)
    const [a, b] = await I.getOutputSizes()
    expect(b).toBe(20)
    expect(a).toBeLessThan(25)
  })

  test("a context menu during a drag ends the drag", async () => {
    await I.goto("events")
    await I.startDrag(0, 40)
    const sizes = await I.output("Sizes").textContent()
    await I.openContextMenu()
    await I.moveDrag(200)
    await I.seeOutput("Sizes", sizes!)
    await I.mouseup()
  })

  test("one-sided handles resize with the keyboard and the pointer", async () => {
    await I.goto("fixed-size")
    await I.focusHandle(0)
    await I.pressKey("ArrowRight", 2)
    await I.seeSizes([52, 48])
    await I.drag(1, -100)
    expect((await I.getSizes())[0]).toBeLessThan(52)
  })
})

test.describe("splitter / collapsible", () => {
  test.beforeEach(async ({ page }) => {
    I = new SplitterModel(page)
    await I.goto("collapsible")
    await I.focusHandle(0)
  })

  test("Enter collapses from the current size", async () => {
    await I.pressKey("ArrowLeft", 3)
    await I.seeHandleValue(0, 12)
    await I.pressKey("Enter")
    await I.seeHandleValue(0, 5)
  })

  test("Enter expands back to the size before the collapse", async () => {
    await I.pressKey("ArrowRight", 3)
    await I.seeHandleValue(0, 18)
    await I.pressKey("Enter")
    await I.seeHandleValue(0, 5)
    await I.pressKey("Enter")
    await I.seeHandleValue(0, 18)
  })

  test("expands back to the size before a drag collapsed it", async () => {
    await I.drag(0, -300)
    await I.seeHandleValue(0, 5)
    await I.focusHandle(0)
    await I.pressKey("Enter")
    await I.seeHandleValue(0, 15)
  })

  test("the value never drops below aria-valuemin when collapsed", async () => {
    await I.pressKey("Enter")
    await I.seeHandleValue(0, 5)
    await I.seeHandleMin(0, 5)
  })
})

test.describe("splitter / layout changes", () => {
  test.beforeEach(({ page }) => {
    I = new SplitterModel(page)
  })

  test("a pixel min applies when narrow and the size comes back when wide", async () => {
    await I.goto("pixel-constraints")
    const wide = await I.panelWidth(0)
    await I.resizeWindow({ width: 500, height: 800 })
    await I.seePanelWidth(0, 240)
    await I.resizeWindow({ width: 1280, height: 720 })
    await I.seePanelWidth(0, wide)
  })

  test("hiding and showing a panel keeps the layout", async () => {
    await I.goto("conditional")
    await I.drag(0, 150)
    const widths = await I.panelWidths()
    await I.clickButton("Hide Right")
    await I.clickButton("Show Right")
    await I.seePanelWidths(widths)
  })
})

test.describe("splitter / events", () => {
  test.beforeEach(async ({ page }) => {
    I = new SplitterModel(page)
    await I.goto("events")
  })

  test("reports each keyboard step and one resize end per drag", async () => {
    await I.focusHandle(0)
    await I.pressKey("ArrowRight", 3)
    await I.seeOutput("Resize count", "3")

    await I.drag(0, 60)
    // three keyboard steps, then one drag
    await I.seeOutput("Resize end reports", /^(\d+\/\d+\/\d+,){3}\d+\/\d+\/\d+$/)
  })

  test("reports collapse and expand", async () => {
    await I.clickButton("Collapse A")
    await I.seeOutput("Collapse reports", "collapse:a")
    await I.clickButton("Expand A")
    await I.seeOutput("Collapse reports", "collapse:a,expand:a")
  })
})

test.describe("splitter / disabled handle", () => {
  test.beforeEach(async ({ page }) => {
    I = new SplitterModel(page)
    await I.goto("events")
    await I.clickButton("Disable second handle")
  })

  test("is marked disabled and can't be focused", async () => {
    await I.seeHandleIsDisabled(1)
  })

  test("F6 skips it", async () => {
    await I.focusHandle(0)
    await I.pressKey("F6")
    await I.seeHandleIsFocused(0)
  })

  test("can't be dragged", async () => {
    const sizes = await I.output("Sizes").textContent()
    await I.drag(1, -100)
    await I.seeOutput("Sizes", sizes!)
  })
})
