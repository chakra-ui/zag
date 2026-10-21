import { expect, test } from "@playwright/test"

test.describe("menu / multiple controlled", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/menu/multiple-controlled")
  })

  for (const first of [0, 1]) {
    test(`pointerdown on trigger ${2 - first} keeps focus there until release`, async ({ page }) => {
      const triggers = page.locator('[data-scope="menu"][data-part="trigger"]')
      const menus = page.getByRole("menu", { includeHidden: true })
      await triggers.nth(first).click()
      await expect(menus.nth(first)).toBeFocused()

      const target = triggers.nth(1 - first)
      await target.hover()
      await page.mouse.down()
      try {
        await expect(menus.nth(first)).toBeHidden()
        await expect(target).toBeFocused()
        await expect(menus.nth(1 - first)).toBeHidden()
      } finally {
        await page.mouse.up()
      }

      await expect(menus.nth(1 - first)).toBeFocused()
      await page.keyboard.press("Escape")
      await expect(menus.nth(1 - first)).toBeHidden()
      await expect(target).toBeFocused()
    })
  }

  test("outside pointerdown keeps focus on a text input", async ({ page }) => {
    await page.locator('[data-part="trigger"]').first().click()
    await expect(page.getByRole("menu")).toBeFocused()
    await page.getByRole("textbox", { name: "Outside input" }).click()
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Outside input" })).toBeFocused()
  })

  test("delayed close keeps outside focus after another menu event and supports reopening", async ({ page }) => {
    await page.getByLabel("Delay close confirmation by one second").check()
    const trigger = page.locator('[data-part="trigger"]').first()
    const input = page.getByRole("textbox", { name: "Outside input" })
    await trigger.click()
    const menu = page.getByRole("menu")
    await expect(menu).toBeFocused()
    await input.click()
    await expect(page.getByTestId("close-pending").first()).toBeVisible()
    // Enter the menu's padding: MENU_POINTERENTER runs while confirmation is pending.
    await menu.hover({ position: { x: 2, y: 2 } })
    await expect(input).toBeFocused()
    await expect(menu).toHaveCount(0)
    await expect(input).toBeFocused()

    await trigger.click()
    await expect(menu).toBeFocused()
    await page.keyboard.press("Escape")
    await expect(menu).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("Escape restores focus after outside dismissal was prevented", async ({ page }) => {
    await page.getByLabel("Prevent outside dismissal").check()
    const trigger = page.locator('[data-part="trigger"]').first()
    await trigger.click()
    await expect(page.getByRole("menu")).toBeFocused()
    await page.getByRole("textbox", { name: "Outside input" }).click()
    await expect(page.getByRole("menu")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test("a disabled trigger does not receive focus or open on pointerdown", async ({ page }) => {
    await page.getByLabel("Disable second trigger").check()
    const triggers = page.locator('[data-part="trigger"]')
    await triggers.first().click()
    await expect(page.getByRole("menu")).toBeFocused()
    const target = triggers.nth(1)
    const box = await target.boundingBox()
    await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await expect(target).not.toBeFocused()
    await expect(target).toHaveAttribute("aria-expanded", "false")
  })

  for (const button of ["middle", "right"] as const) {
    test(`${button} pointerdown does not open a closed menu`, async ({ page }) => {
      const input = page.getByRole("textbox", { name: "Outside input" })
      await input.click()
      const target = page.locator('[data-part="trigger"]').first()
      await target.hover()
      await page.mouse.down({ button })
      try {
        // Right-click may natively focus a button; middle-click keeps its prevented default.
        if (button === "middle") await expect(target).not.toBeFocused()
        await expect(page.getByRole("menu")).toHaveCount(0)
      } finally {
        await page.mouse.up({ button })
      }
    })
  }

  test("canceling a press on another trigger keeps focus there without opening its menu", async ({ page }) => {
    const triggers = page.locator('[data-part="trigger"]')
    const target = triggers.nth(1)
    await triggers.first().click()
    await expect(page.getByRole("menu")).toBeFocused()
    await target.hover()
    await page.mouse.down()
    try {
      await expect(page.getByRole("menu")).toHaveCount(0)
      await expect(target).toBeFocused()
      await page.mouse.move(600, 450)
    } finally {
      await page.mouse.up()
    }
    await expect(page.getByRole("menu")).toHaveCount(0)
    await expect(target).toBeFocused()
  })

  for (const gesture of ["Escape", "selection", "trigger click", "nonfocusable outside"] as const) {
    test(`${gesture} still restores focus to the opening trigger`, async ({ page }) => {
      const trigger = page.locator('[data-part="trigger"]').first()
      await trigger.click()
      await expect(page.getByRole("menu")).toBeFocused()

      if (gesture === "Escape") await page.keyboard.press("Escape")
      if (gesture === "selection") await page.getByRole("menuitem", { name: "Edit", exact: true }).click()
      if (gesture === "trigger click") await trigger.click()
      if (gesture === "nonfocusable outside") await page.locator("main").click({ position: { x: 450, y: 250 } })

      await expect(page.getByRole("menu")).toHaveCount(0)
      await expect(trigger).toBeFocused()
    })
  }

  test.describe("touch", () => {
    test.use({ hasTouch: true })

    test("tapping another trigger switches menus and restores focus on Escape", async ({ page }) => {
      const triggers = page.locator('[data-part="trigger"]')
      const menus = page.getByRole("menu", { includeHidden: true })
      await triggers.first().tap()
      await expect(menus.first()).toBeFocused()
      await triggers.nth(1).tap()
      await expect(menus.first()).toBeHidden()
      await expect(menus.nth(1)).toBeFocused()
      await page.keyboard.press("Escape")
      await expect(menus.nth(1)).toBeHidden()
      await expect(triggers.nth(1)).toBeFocused()
    })
  })
})
