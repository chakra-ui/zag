import { expect, type Page } from "@playwright/test"
import { rect, textSelection } from "../_utils"
import { Model } from "./model"

export class TourModel extends Model {
  constructor(page: Page) {
    super(page)
  }

  checkSelection() {
    return textSelection(this.page)
  }

  goto() {
    return this.page.goto("/tour")
  }

  private get content() {
    return this.page.locator("[data-scope=tour][data-part=content]")
  }

  private getStep(stepId: string) {
    return this.page.locator(`[data-scope=tour][data-part=content][data-step=${stepId}]`)
  }

  private get title() {
    return this.content.locator("[data-part=title]")
  }

  private get target() {
    return this.page.locator("[data-tour-highlighted]")
  }

  private get spotlight() {
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

  clickStart() {
    return this.page.getByRole("button", { name: "Start" }).click()
  }

  clickOutside() {
    return this.page.click("body", { force: true, position: { x: 200, y: 100 } })
  }

  selectTargetText() {
    return this.target.selectText()
  }

  async seeContentIsCentered() {
    return expect(await this.isContentCentered()).toBeTruthy()
  }

  async seeContent() {
    return expect(this.content).toBeVisible()
  }

  async dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  async seeStep(stepId: string) {
    await expect(this.getStep(stepId)).toBeVisible()
  }

  async seeSpotlight() {
    // locator.toBeInViewport() is flaky due tests not waiting for tour state/auto-scroll to settle
    // await expect(this.spotlight).toBeInViewport()
    await expect(this.spotlight).toBeVisible()
  }

  async seeTarget(text: string) {
    const target = this.page.getByRole("heading", { name: text })
    // await expect(target).toBeInViewport()
    await expect(target).toBeVisible()
  }

  async seeIframeTarget(text: string) {
    const target = this.page.frameLocator("iframe").getByRole("heading", { name: text })
    // await expect(target).toBeInViewport()
    await expect(target).toBeVisible()
  }

  async seeSpotlightAroundTarget() {
    const targetRect = await this.getTargetRect()
    const spotlightRect = await this.getSpotlightRect()

    // spotlight rect to be greater than content rect
    expect(spotlightRect.width).toBeGreaterThan(targetRect.width)
    expect(spotlightRect.height).toBeGreaterThan(targetRect.height)
  }

  async seeTitle(title: string) {
    return expect(this.title).toContainText(title)
  }
}
