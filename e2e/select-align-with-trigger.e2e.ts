import { expect, type Locator, type Page, test } from "@playwright/test"
import { isInViewport } from "./_utils"

class AlignedSelectModel {
  private root: Locator
  private scopeId: string | null = null

  constructor(
    private page: Page,
    label: string,
  ) {
    this.root = page.locator("[data-select-root]", {
      has: page.locator(`[data-select-label]`, { hasText: label }),
    })
  }

  goto() {
    return this.page.goto("/select/align-item-with-trigger")
  }

  /** Resolve the scope ID from the root element to find portaled children. */
  private async getScopeId() {
    if (!this.scopeId) {
      this.scopeId = await this.root.getAttribute("data-select-root")
    }
    return this.scopeId!
  }

  get trigger() {
    return this.root.locator("[data-select-trigger]")
  }

  get valueText() {
    return this.root.locator("[data-select-value-text]")
  }

  /** Content is portaled — find via scope ID, not DOM parent. */
  get content() {
    return this.page.locator(`[data-select-content="${this.scopeId}"]`)
  }

  get positioner() {
    return this.page.locator(`[data-select-positioner="${this.scopeId}"]`)
  }

  getItem(text: string) {
    return this.content.locator("[data-select-item]", { hasText: text })
  }

  getItemText(text: string) {
    return this.content.locator("[data-select-item-text]", { hasText: text })
  }

  get checkedItemText() {
    return this.content.locator('[data-select-item-text][data-state="checked"]')
  }

  get highlightedItem() {
    return this.content.locator("[data-select-item][data-highlighted]")
  }

  scrollArrow(placement: "top" | "bottom") {
    return this.positioner.locator(`[data-select-scroll-arrow][data-placement="${placement}"]`)
  }

  async clickTrigger() {
    await this.getScopeId()
    await this.trigger.click()
  }

  async seeDropdown() {
    await expect(this.content).toBeVisible()
  }

  async dontSeeDropdown() {
    await expect(this.content).not.toBeVisible()
  }

  async seeAlignedMode() {
    await expect(this.content).toHaveAttribute("data-align-with-trigger", "")
  }

  async seeFallbackMode() {
    const attr = await this.content.getAttribute("data-align-with-trigger")
    expect(attr).toBeNull()
  }

  async seeSelectedItemAligned() {
    const valueBox = await this.valueText.boundingBox()
    const itemBox = await this.checkedItemText.boundingBox()
    expect(valueBox).toBeTruthy()
    expect(itemBox).toBeTruthy()
    expect(Math.abs(valueBox!.x - itemBox!.x)).toBeLessThan(2)
    expect(Math.abs(valueBox!.y - itemBox!.y)).toBeLessThan(2)
  }

  async seeScrollArrow(placement: "top" | "bottom") {
    await expect(this.scrollArrow(placement)).toHaveAttribute("data-state", "visible")
  }

  async dontSeeScrollArrow(placement: "top" | "bottom") {
    await expect(this.scrollArrow(placement)).toHaveAttribute("data-state", "hidden")
  }

  async seeItemInViewport(text: string) {
    expect(await isInViewport(this.content, this.getItem(text))).toBe(true)
  }
}

test.describe("select / align with trigger", () => {
  test.describe("middle (aligned mode)", () => {
    let I: AlignedSelectModel

    test.beforeEach(async ({ page }) => {
      I = new AlignedSelectModel(page, "Middle")
      await I.goto()
    })

    test("should align selected item text with trigger value text", async () => {
      await I.clickTrigger()
      await I.seeDropdown()
      await I.seeAlignedMode()
      await I.seeSelectedItemAligned()
    })

    test("should select a different item, reopen, and realign", async () => {
      await I.clickTrigger()
      await I.seeDropdown()

      await I.getItem("Cherry").click()
      await I.dontSeeDropdown()
      await expect(I.valueText).toHaveText("Cherry")

      await I.clickTrigger()
      await I.seeDropdown()
      await I.seeAlignedMode()
      await I.seeSelectedItemAligned()
    })

    test("should navigate down with arrow keys", async () => {
      await I.clickTrigger()
      await I.seeDropdown()

      await I.content.press("ArrowDown")
      await expect(I.highlightedItem).toBeVisible()

      await I.content.press("ArrowDown")
      await I.content.press("ArrowDown")
      await expect(I.highlightedItem).toHaveAttribute("data-value", "papaya")
    })

    test("should navigate up with arrow keys", async () => {
      await I.clickTrigger()
      await I.seeDropdown()

      await I.content.press("ArrowUp")
      await expect(I.highlightedItem).toBeVisible()

      await I.content.press("ArrowUp")
      await I.content.press("ArrowUp")
      await expect(I.highlightedItem).toHaveAttribute("data-value", "honeydew")
    })

    test("should close cleanly on escape", async () => {
      await I.clickTrigger()
      await I.seeDropdown()

      await I.content.press("Escape")
      await I.dontSeeDropdown()
    })
  })

  test.describe("top edge (constrained aligned)", () => {
    let I: AlignedSelectModel

    test.beforeEach(async ({ page }) => {
      I = new AlignedSelectModel(page, "Top")
      await I.goto()
    })

    test("should open and show selected item near top edge", async () => {
      await I.clickTrigger()
      await I.seeDropdown()
      await I.seeItemInViewport("Pineapple")
    })
  })

  test.describe("bottom edge (fallback mode)", () => {
    let I: AlignedSelectModel

    test.beforeEach(async ({ page }) => {
      I = new AlignedSelectModel(page, "Bottom")
      await I.goto()
    })

    test("should fall back to standard positioning", async () => {
      await I.clickTrigger()
      await I.seeDropdown()
      await I.seeFallbackMode()
    })

    test("should have selected item visible in fallback mode", async () => {
      await I.clickTrigger()
      await I.seeDropdown()
      await I.seeItemInViewport("Watermelon")
    })
  })
})
