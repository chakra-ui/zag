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

  goto() {
    return this.page.goto("/tabs")
  }

  private getTabTrigger = (id: string) => {
    return this.page.locator(testid(`${id}-tab`))
  }

  private getTabContent = (id: string) => {
    return this.page.locator(testid(`${id}-tab-panel`))
  }

  private getIndicator = () => {
    return this.page.locator("[data-scope='tabs'][data-part='indicator']")
  }

  clickTab = async (id: string) => {
    await this.getTabTrigger(id).click()
  }

  seeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).toBeVisible()
  }

  dontSeeTabContent = async (id: string) => {
    await expect(this.getTabContent(id)).not.toBeVisible()
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
        const indicator = document.querySelector('[data-scope="tabs"][data-part="indicator"]')
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
