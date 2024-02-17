import { expect, type Page } from "@playwright/test"
import { controls, rect, textSelection } from "../_utils"

export class TourModel {
  constructor(private page: Page) {}

  get controls() {
    return controls(this.page)
  }

  getSelection() {
    return textSelection(this.page)
  }

  goto() {
    return this.page.goto("/tour")
  }

  start() {
    return this.page.getByRole("button", { name: "Start" }).click()
  }

  arrowRight() {
    return this.page.keyboard.press("ArrowRight")
  }

  arrowLeft() {
    return this.page.keyboard.press("ArrowLeft")
  }

  esc() {
    return this.page.keyboard.press("Escape")
  }

  get content() {
    return this.page.locator("[data-scope=tour][data-part=content]")
  }

  get title() {
    return this.content.locator("[data-part=title]")
  }

  get target() {
    return this.page.locator("[data-tour-highlighted]")
  }

  get iframeTarget() {
    return this.page.frameLocator("iframe").first().locator("[data-tour-highlighted]")
  }

  get spotlight() {
    return this.page.locator("[data-scope=tour][data-part=spotlight]")
  }

  getTargetRect() {
    return rect(this.target)
  }

  getSpotlightRect() {
    return rect(this.spotlight)
  }

  private isContentCentered() {
    return this.content.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const centeredX = rect.left + rect.width / 2 === window.innerWidth / 2
      const centeredY = rect.top + rect.height / 2 === window.innerHeight / 2
      return centeredX && centeredY
    })
  }

  async expectToBeCentered() {
    return expect(await this.isContentCentered()).toBeTruthy()
  }

  clickOutside() {
    return this.page.click("body", { force: true, position: { x: 200, y: 100 } })
  }
}
