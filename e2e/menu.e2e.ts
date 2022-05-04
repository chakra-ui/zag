import { expect, Page, test } from "@playwright/test"
import { clickOutside, testid } from "./__utils"

const menu_1 = {
  trigger: testid("trigger"),
  menu: testid("menu"),
  sub_trigger: testid("more-tools"),
}

const menu_2 = {
  trigger: testid("more-tools"),
  menu: testid("more-tools-submenu"),
  sub_trigger: testid("open-nested"),
}

const menu_3 = {
  trigger: testid("open-nested"),
  menu: testid("open-nested-submenu"),
}

const expectToBeFocused = async (page: Page, id: string) => {
  return await expect(page.locator(id)).toHaveAttribute("data-focus", "")
}

const navigateToSubmenu = async (page: Page) => {
  await page.click(menu_1.trigger)
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowDown")
}

test.describe("menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/nested-menu")
  })

  test("[keyboard] should not open submenu when moving focus to trigger", async ({ page }) => {
    await navigateToSubmenu(page)
    await expect(page.locator(menu_2.menu)).toBeHidden()
  })

  test.describe("[keyboard / submenu trigger] should open submenu and focus first item", () => {
    test.beforeEach(async ({ page }) => {
      await navigateToSubmenu(page)
    })

    test.afterEach(async ({ page }) => {
      await expect(page.locator(menu_2.menu)).toBeVisible()
      await expect(page.locator(menu_2.menu)).toBeFocused()
      await expectToBeFocused(page, menu_2.trigger)
    })

    test("with space", async ({ page }) => {
      await page.keyboard.press("Space")
    })

    test("with enter", async ({ page }) => {
      await page.keyboard.press("Enter")
    })

    test("with right arrow", async ({ page }) => {
      await page.keyboard.press("ArrowRight")
    })
  })

  test("[keyboard / hide submenu]", async ({ page }) => {
    await navigateToSubmenu(page)
    await page.keyboard.press("Enter", { delay: 20 })
    await page.keyboard.press("ArrowLeft")
    await expect(page.locator(menu_2.menu)).toBeHidden()
  })

  test("[keyboard / typeahead] should scope typeahead behaviour to the active menu", async ({ page }) => {
    await page.click(menu_1.trigger)

    await page.keyboard.type("n")
    await expectToBeFocused(page, testid("new-tab"))

    await page.keyboard.type("n")
    await expectToBeFocused(page, testid("new-win"))

    await page.keyboard.press("ArrowDown")

    // open submenu
    await page.keyboard.press("ArrowRight")
    await expect(page.locator(menu_2.menu)).toBeVisible()

    await page.keyboard.type("n")
    await expectToBeFocused(page, testid("name-win"))
    await page.keyboard.type("n")
    await expectToBeFocused(page, testid("new-term"))
  })

  test.describe("[select submenu item]", () => {
    test.afterEach(async ({ page }) => {
      // close all
      await expect(page.locator(menu_1.menu)).toBeHidden()
      await expect(page.locator(menu_2.menu)).toBeHidden()
      await expect(page.locator(menu_3.menu)).toBeHidden()

      // focus trigger
      await expect(page.locator(menu_1.trigger)).toBeFocused()
    })

    test("keyboard select", async ({ page }) => {
      // open menu 1
      await page.click(menu_1.trigger)

      // open menu 2
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter", { delay: 10 })

      // open menu 3
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter", { delay: 10 })

      // select first item in menu 3
      await page.keyboard.press("Enter", { delay: 10 })
    })

    test("pointer click", async ({ page }) => {
      await page.click(menu_1.trigger)
      await page.hover(menu_1.sub_trigger)
      await page.hover(menu_2.sub_trigger)

      await page.hover(testid("playground"))
      await page.click(testid("playground"))
    })

    test("outside click", async ({ page }) => {
      await page.click(menu_1.trigger)
      await page.hover(menu_2.trigger)
      await page.hover("body", { position: { x: 10, y: 10 } })
      await clickOutside(page)
    })
  })

  test.describe("[pointer / activation]", () => {
    test("should open submenu and not focus first item", async ({ page }) => {
      await page.click(menu_1.trigger)
      await page.hover(menu_1.sub_trigger)

      await expect(page.locator(menu_2.menu)).toBeVisible()
      await expect(page.locator(menu_2.menu)).toBeFocused()
      await expectToBeFocused(page, menu_2.trigger)

      const focusedItemCount = await page.locator(menu_2.menu).locator("[data-focused]").count()
      expect(focusedItemCount).toBe(0)
    })

    test("should not close when moving pointer to submenu and back to parent trigger", async ({ page }) => {
      await page.click(menu_1.trigger)

      await page.hover(menu_1.sub_trigger)
      await page.hover(testid("save-page"))
      await page.hover(menu_1.sub_trigger)

      await expect(page.locator(menu_1.menu)).toBeVisible()
      await expect(page.locator(menu_2.menu)).toBeVisible()
    })

    test("should close submenu when moving pointer away", async ({ page }) => {
      await page.click(menu_1.trigger)
      await page.hover(menu_2.trigger)

      const menu_el = page.locator(menu_2.trigger)
      const bbox = await menu_el.boundingBox()

      await page.hover("body", { position: { x: bbox.x - 20, y: bbox.height / 2 + bbox.y } })
      await expect(page.locator(menu_2.menu)).toBeHidden()
      await expect(page.locator(menu_1.menu)).toBeFocused()
    })

    test("should close open submenu when moving pointer to parent menu item", async ({ page }) => {
      await page.click(menu_1.trigger)
      await page.hover(menu_2.trigger)

      const menuitem = testid("new-tab")

      await page.hover(menuitem)
      // dispatch extra mouse movement to trigger hover
      await page.locator(menuitem).dispatchEvent("pointermove")

      await expect(page.locator(menu_2.menu)).toBeHidden()
      await expect(page.locator(menu_1.menu)).toBeVisible()
      await expect(page.locator(menu_1.menu)).toBeFocused()
      await expectToBeFocused(page, testid("new-tab"))
    })
  })
})
