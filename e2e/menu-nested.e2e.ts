import { expect, test } from "@playwright/test"
import { MenuNestedModel } from "./models/menu-nested.model"
import { clickOutside, rect } from "./_utils"

let I: MenuNestedModel

test.describe("nested menu / pointer", async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu-nested")
  })
})

test.describe("nested menu / keyboard navigation", async () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuNestedModel(page)
    await I.goto()
  })

  test("open submenu when moving focus to trigger", async () => {
    await I.navigateToSubmenuTrigger()
    await expect(I.menu2.menu).toBeHidden()
  })

  test("open submenu with space", async () => {
    await I.navigateToSubmenuTrigger()
    await I.page.keyboard.press("Space")
    await I.page.waitForTimeout(1)
    await I.expectSubmenuToBeFocused()
  })

  test("open submenu with enter", async () => {
    await I.navigateToSubmenuTrigger()
    await I.page.keyboard.press("Enter")
    await I.expectSubmenuToBeFocused()
  })

  test("open submenu with arrow right", async () => {
    await I.navigateToSubmenuTrigger()
    await I.page.keyboard.press("ArrowRight")
    await I.expectSubmenuToBeFocused()
  })

  test("close submenu with arrow left", async () => {
    await I.navigateToSubmenuTrigger()
    await I.page.keyboard.press("Enter", { delay: 20 })
    await I.page.keyboard.press("ArrowLeft")
    await expect(I.menu2.menu).toBeHidden()
  })
})

test.describe("nested menu / keyboard typeahead", async () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuNestedModel(page)
    await I.goto()
  })

  test("parent menu", async () => {
    await I.menu1.trigger.click()
    await expect(I.menu1.menu).toBeFocused()

    await I.page.keyboard.type("n")
    await I.expectToBeHighlighted(I.getTestId("new-file"))

    await I.page.keyboard.type("n")
    await I.expectToBeHighlighted(I.getTestId("new-tab"))

    await I.page.keyboard.type("new w")
    await I.expectToBeHighlighted(I.getTestId("new-win"))
  })

  test("nested menu", async () => {
    await I.menu1.trigger.click()
    await expect(I.menu1.menu).toBeFocused()

    await I.page.keyboard.type("m")
    await I.expectToBeHighlighted(I.getTestId("more-tools"))

    // open submenu
    await I.page.keyboard.press("Enter")
    await I.expectSubmenuToBeFocused()

    await I.page.keyboard.type("s")
    await I.expectToBeHighlighted(I.getTestId("switch-win"))
  })
})

test.describe("nested menu / select item", () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuNestedModel(page)
    await I.goto()
  })

  test("using keyboard", async () => {
    await I.navigateToSubmenuTrigger()
    await I.page.keyboard.press("Enter")
    await I.expectSubmenuToBeFocused()

    // open menu 3
    await I.page.keyboard.press("ArrowDown")
    await I.page.keyboard.press("ArrowDown")
    await I.page.keyboard.press("ArrowDown")
    await I.page.keyboard.press("Enter")
    await expect(I.menu3.menu).toBeFocused()

    // select first item in menu 3
    await I.page.keyboard.press("Enter")
    await I.expectAllMenusToBeClosed()
  })

  test("using pointer click", async () => {
    await I.menu1.trigger.click()
    await expect(I.menu1.menu).toBeFocused()
    await I.menu1.subTrigger.hover()
    await I.menu2.subTrigger.hover()

    await I.getTestId("playground").hover()
    await I.getTestId("playground").click()
    await I.expectAllMenusToBeClosed()
  })

  test("clicking outside or blur", async () => {
    await I.menu1.trigger.click()
    await I.menu2.trigger.hover()
    await I.page.hover("body", { position: { x: 10, y: 10 } })
    await clickOutside(I.page)
    await I.expectAllMenusToBeClosed()
  })
})

test.describe("nested menu / pointer movement", async () => {
  test.beforeEach(async ({ page }) => {
    I = new MenuNestedModel(page)
    await I.goto()
  })

  test("should open submenu and not focus first item", async () => {
    await I.menu1.trigger.click()
    // await expect(I.menu1.menu).toBeFocused()
    await I.menu1.subTrigger.hover()

    await expect(I.menu2.menu).toBeVisible()
    await expect(I.menu2.menu).toBeFocused()
    await I.expectToBeHighlighted(I.menu2.trigger)

    const focusedItemCount = await I.menu2.menu.locator("[data-focus]").count()
    expect(focusedItemCount).toBe(0)
  })

  test("should not close when moving pointer to submenu and back to parent trigger", async () => {
    await I.menu1.trigger.click()

    await I.menu1.subTrigger.hover()

    await I.getTestId("save-page").hover()
    await I.menu1.subTrigger.hover()

    await expect(I.menu1.menu).toBeVisible()
    await expect(I.menu2.menu).toBeVisible()
  })

  test("should close submenu when moving pointer away", async () => {
    await I.menu1.trigger.click()
    await I.menu2.trigger.hover()

    const bbox = await rect(I.menu2.trigger)

    await I.page.hover("body", { position: { x: bbox.x - 20, y: bbox.height / 2 + bbox.y } })
    await expect(I.menu2.menu).toBeHidden()
    await expect(I.menu1.menu).toBeFocused()
  })

  test("should close open submenu when moving pointer to parent menu item", async () => {
    await I.menu1.trigger.click()
    await expect(I.menu1.menu).toBeVisible()
    await I.menu2.trigger.hover()
    await expect(I.menu2.menu).toBeVisible()

    const menuitem = I.getTestId("new-tab")

    // FIXME: .hover() causes "subtree intercepts pointer events" error in shadow-dom
    await menuitem.hover()
    // dispatch extra mouse movement to trigger hover
    await menuitem.dispatchEvent("pointermove")

    await expect(I.menu2.menu).toBeHidden()
    await expect(I.menu1.menu).toBeVisible()
    await expect(I.menu1.menu).toBeFocused()
    await I.expectToBeHighlighted(I.getTestId("new-tab"))
  })
})
