import { test, expect } from "@playwright/test"
import { DndModel } from "./models/dnd.model"

let I: DndModel

test.describe("dnd / list", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("list")
  })

  test("pointer drag reorders items", async () => {
    await I.seeOrder(["Apple", "Banana", "Cherry", "Date", "Elderberry"])
    await I.dragTo("3", "1", "before")
    await I.seeOrder(["Cherry", "Apple", "Banana", "Date", "Elderberry"])
  })

  test("pointer drag after last item", async () => {
    await I.dragTo("1", "5", "after")
    await I.seeOrder(["Banana", "Cherry", "Date", "Elderberry", "Apple"])
  })

  test("escape cancels pointer drag", async ({ page }) => {
    const handle = I.getDragHandle("1")
    const box = await handle.boundingBox()

    await page.mouse.move(box!.x + 5, box!.y + 5)
    await page.mouse.down()

    await expect(I.getRoot()).toHaveAttribute("data-dragging", "")

    await page.mouse.move(box!.x + 50, box!.y + 80, { steps: 3 })
    await expect(I.getRoot()).toHaveAttribute("data-dragging", "")
    await page.keyboard.press("Escape")

    await I.seeNotDragging()
    await I.seeOrder(["Apple", "Banana", "Cherry", "Date", "Elderberry"])
  })
})

test.describe("dnd / keyboard", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("list")
  })

  test("keyboard grab → tab → drop", async () => {
    await I.focusHandle("3")
    await I.pressKey("Enter")
    await I.pressKey("Tab") // → Apple (1)
    await I.pressKey("Enter") // drop before Apple

    await I.seeOrder(["Cherry", "Apple", "Banana", "Date", "Elderberry"])
  })

  test("keyboard grab → tab → tab → arrow → drop", async () => {
    await I.focusHandle("1")
    await I.pressKey("Enter")
    await I.pressKey("Tab") // → Banana (2)
    await I.pressKey("Tab") // → Cherry (3)
    await I.pressKey("ArrowDown") // before → after
    await I.pressKey("Enter") // drop after Cherry

    await I.seeOrder(["Banana", "Cherry", "Apple", "Date", "Elderberry"])
  })

  test("keyboard escape cancels", async () => {
    await I.focusHandle("1")
    await I.pressKey("Enter")
    await I.pressKey("Tab")
    await I.pressKey("Escape")

    await I.seeNotDragging()
    await I.seeOrder(["Apple", "Banana", "Cherry", "Date", "Elderberry"])
  })

  test("drag source is skipped in tab sequence", async () => {
    await I.focusHandle("3")
    await I.pressKey("Enter")

    const targets: string[] = []
    for (let i = 0; i < 4; i++) {
      await I.pressKey("Tab")
      const indicator = await I.getActiveIndicator()
      if (indicator?.value) targets.push(indicator.value)
    }

    expect(targets).not.toContain("3")
    expect(targets).toEqual(["1", "2", "4", "5"])

    await I.pressKey("Escape")
  })
})

test.describe("dnd / grid", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("grid")
  })

  test("pointer drag reorders grid items", async ({ page }) => {
    const handle = I.getDragHandle("1")
    const target = I.getDropTarget("5")
    const hb = await handle.boundingBox()
    const tb = await target.boundingBox()

    await page.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2)
    await page.mouse.down()

    await expect(I.getRoot()).toHaveAttribute("data-dragging", "")

    // Left side of Item 5 = "before" in grid (horizontal collision)
    await page.mouse.move(tb!.x + 10, tb!.y + tb!.height / 2, { steps: 5 })
    await page.mouse.up()

    await expect(I.getRoot()).not.toHaveAttribute("data-dragging")
    await I.seeOrder(["Item 2", "Item 3", "Item 4", "Item 1", "Item 5", "Item 6", "Item 7", "Item 8", "Item 9"])
  })

  test("keyboard grid navigation: arrow down jumps rows", async () => {
    await I.focusHandle("1")
    await I.pressKey("Enter")
    await I.pressKey("ArrowRight") // → Item 2
    await I.seeIndicator("2", "before")
    await I.pressKey("ArrowDown") // → Item 5 (jump 3 columns)
    await I.seeIndicator("5", "before")
    await I.pressKey("ArrowUp") // → Item 2 (jump back)
    await I.seeIndicator("2", "before")
    await I.pressKey("Escape")
  })
})

test.describe("dnd / multi-item", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("multi-item")
  })

  test("multi-item drag moves all selected items", async () => {
    await I.selectItem("2") // Banana
    await I.selectItem("3") // Cherry
    await I.selectItem("4") // Date

    await I.dragTo("3", "6", "after")

    await I.seeOrder(["Apple", "Elderberry", "Fig", "Banana", "Cherry", "Date"])
  })
})

test.describe("dnd / transfer", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("transfer")
  })

  test("drag item between containers", async () => {
    await I.dragTo("cherry", "broccoli", "after")

    const order = await I.getOrder()
    expect(order).toContain("Cherry")

    const cherryIdx = order.indexOf("Cherry")
    const broccoliIdx = order.indexOf("Broccoli")
    expect(cherryIdx).toBeGreaterThan(broccoliIdx)
  })
})

test.describe("dnd / drag-preview", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("drag-preview")
  })

  test("shows drag preview while dragging", async ({ page }) => {
    const handle = I.getDragHandle("3")
    const box = await handle.boundingBox()

    await page.mouse.move(box!.x + 5, box!.y + 5)
    await page.mouse.down()

    await expect(I.getRoot()).toHaveAttribute("data-dragging", "")

    await page.mouse.move(box!.x + 100, box!.y + 100, { steps: 3 })
    await I.seeDragPreview("Cherry")

    await page.mouse.up()
    await I.seeNoDragPreview()
  })
})

test.describe("dnd / auto-scroll", () => {
  test.beforeEach(async ({ page }) => {
    I = new DndModel(page)
    await I.goto("auto-scroll")
  })

  test("auto-scrolls when dragging near container edge", async ({ page }) => {
    expect(await I.getScrollTop()).toBe(0)

    const handle = I.getDragHandle("1")
    const hb = await handle.boundingBox()
    const containerBox = await I.getScrollContainerBox()

    await page.mouse.move(hb!.x + 5, hb!.y + 5)
    await page.mouse.down()

    await expect(I.getRoot()).toHaveAttribute("data-dragging", "")

    // Move to bottom edge to trigger auto-scroll
    await page.mouse.move(containerBox!.x + containerBox!.width / 2, containerBox!.y + containerBox!.height - 5, {
      steps: 5,
    })

    // Wait for scroll to happen
    await expect.poll(() => I.getScrollTop(), { timeout: 3000 }).toBeGreaterThan(50)

    await page.mouse.up()
  })
})
