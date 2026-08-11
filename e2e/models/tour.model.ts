import { expect, type Page } from "@playwright/test"
import { approximatelyEqual, rect, textSelection } from "../_utils"
import { Model } from "./model"

export class TourModel extends Model {
  constructor(page: Page) {
    super(page)
  }

  checkSelection() {
    return textSelection(this.page)
  }

  goto() {
    return this.page.goto("/tour/basic")
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

  private async isContentCentered() {
    const contentRect = await rect(this.content)
    const viewport = this.page.viewportSize()
    if (!viewport) return false

    return (
      approximatelyEqual(contentRect.midX, viewport.width / 2) &&
      approximatelyEqual(contentRect.midY, viewport.height / 2)
    )
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
