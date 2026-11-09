import { expect, type Page } from "@playwright/test"
import { a11y, rect, testid } from "../_utils"
import { Model } from "./model"

const INDICATOR_POSITION_TOLERANCE = 2

type Rect = Awaited<ReturnType<typeof rect>>

export class TabsModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  goto(url = "/tabs/basic") {
    return this.page.goto(url)
  }

  private getTabTrigger = (id: string) => {
    return this.page.locator(testid(`${id}-tab`))
  }

  private getTabContent = (id: string) => {
    return this.page.locator(testid(`${id}-tab-panel`))
  }

  private getIndicator = () => {
    return this.page.locator("[data-tabs-indicator]")
  }

  private getPanelByName = (name: string) => {
    return this.page.getByRole("tabpanel", { name, includeHidden: true })
  }

  clickButton = async (name: string) => {
    await this.page.getByRole("button", { name }).click()
  }

  seeTabIsSelected = async (name: string) => {
    await expect(this.page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true")
  }

  clickTabByName = async (name: string) => {
    await this.page.getByRole("tab", { name }).click()
  }

  seePanelState = async (name: string, state: string | null) => {
    const panel = this.getPanelByName(name)
    if (state == null) await expect(panel).not.toHaveAttribute("data-state")
    else await expect(panel).toHaveAttribute("data-state", state)
  }

  seePanelIsVisible = async (name: string) => {
    await expect(this.getPanelByName(name)).toBeVisible()
  }

  seePanelIsHidden = async (name: string) => {
    await expect(this.getPanelByName(name)).toBeHidden()
  }

  seeActivationDirection = async (direction: string) => {
    await expect(this.page.locator("[data-tabs-root]")).toHaveAttribute("data-activation-direction", direction)
  }

  clickTab = async (id: string) => {
    await this.getTabTrigger(id).click()
  }

  focusTab = async (id: string) => {
    await this.getTabTrigger(id).focus()
  }

  seeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).toBeVisible()
  }

  dontSeeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).not.toBeVisible()
  }

  /** Keyboard selection lands a frame after the key press */
  waitForKeyboardSelection = async () => {
    await this.page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    )
  }

  /** The tab that Tab lands on when entering the tablist */
  seeTabIsTabStop = async (id: string) => {
    await expect(this.getTabTrigger(id)).toHaveAttribute("tabindex", "0")
  }

  disableSelectedTab = async () => {
    await this.page.locator(testid("disable-selected")).check()
  }

  seeTabIsFocused = async (id: string) => {
    await expect(this.getTabTrigger(id)).toBeFocused()
  }

  getIndicatorRect = async () => {
    return await rect(this.getIndicator())
  }

  modifyTabContent = async (id: string, newContent: string) => {
    const content = this.getTabContent(id)
    await content.evaluate((el, text) => {
      const p = el.querySelector("p")
      if (p) {
        p.textContent = text
      }
    }, newContent)
  }

  modifyTabLabel = async (id: string, newLabel: string) => {
    const trigger = this.getTabTrigger(id)
    await trigger.evaluate((el, text) => {
      el.textContent = text
    }, newLabel)
  }

  getTabRect = async (id: string) => {
    return await rect(this.getTabTrigger(id))
  }

  seeIndicatorAlignedWithTab = async (tabId: string) => {
    const tabRect = await this.getTabRect(tabId)
    const indicatorRect = await this.getIndicatorRect()

    expect(tabRect).not.toBeNull()
    expect(indicatorRect).not.toBeNull()

    if (tabRect && indicatorRect) {
      expect(Math.abs(indicatorRect.x - tabRect.x)).toBeLessThan(INDICATOR_POSITION_TOLERANCE)
    }
  }

  seeIndicatorMovedWithTab = async (tabId: string, beforeTab: Rect, beforeIndicator: Rect) => {
    const afterTab = await this.getTabRect(tabId)
    const afterIndicator = await this.getIndicatorRect()

    expect(afterTab).not.toBeNull()
    expect(afterIndicator).not.toBeNull()

    if (beforeTab && afterTab && beforeIndicator && afterIndicator) {
      const tabMoved = afterTab.x !== beforeTab.x

      if (tabMoved) {
        // Verify indicator is aligned with the tab after the move
        expect(Math.abs(afterIndicator.x - afterTab.x)).toBeLessThan(INDICATOR_POSITION_TOLERANCE)
      }
    }
  }

  waitForIndicatorToUpdate = async (tabId: string) => {
    await this.page.waitForFunction(
      ({ tabId, tolerance }) => {
        const tab = document.querySelector(`[data-testid="${tabId}-tab"]`)
        const indicator = document.querySelector("[data-tabs-indicator]")
        if (!tab || !indicator) return false

        const tabRect = tab.getBoundingClientRect()
        const indicatorRect = indicator.getBoundingClientRect()

        // Wait for indicator to be aligned with the tab
        return Math.abs(indicatorRect.x - tabRect.x) < tolerance
      },
      { tabId, tolerance: INDICATOR_POSITION_TOLERANCE },
    )

    // Wait for CSS transitions/animations to complete
    await this.getIndicator().evaluate((el) =>
      Promise.all([...el.getAnimations()].map((animation) => animation.finished)),
    )
  }
}
