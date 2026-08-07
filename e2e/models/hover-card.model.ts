import { expect, type Page } from "@playwright/test"
import { a11y, part, testid } from "../_utils"
import { Model } from "./model"

// the basic example's controls
export const OPEN_DELAY = 700
const CLOSE_DELAY = 300
/** Enough to flush the tracker's coalescing animation frame. */
const FRAME = 32
/** The example's exit keyframes, which keep the node visible until they finish. */
const EXIT_ANIMATION = 200

export class HoverCardModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility(selector?: string) {
    return a11y(this.page, selector ?? part("hover-card", "trigger"))
  }

  private clockInstalled = false

  /**
   * Time is driven explicitly via `page.clock` rather than slept through, so the open and close
   * delays are deterministic instead of races.
   */
  async goto(url = "/hover-card/basic") {
    if (!this.clockInstalled) {
      await this.page.clock.install()
      this.clockInstalled = true
    }
    await this.page.goto(url)
  }

  /** Advance the mocked clock, flushing timers and animation frames. */
  advance = async (ms: number) => {
    await this.page.clock.runFor(ms)
  }

  get trigger() {
    return this.page.locator(part("hover-card", "trigger"))
  }

  get content() {
    return this.page.locator(part("hover-card", "content"))
  }

  get testText() {
    return this.page.locator(testid("test-text"))
  }

  hoverTrigger = async () => {
    await this.trigger.hover()
    await this.advance(OPEN_DELAY)
  }

  hoverContent = async () => {
    await this.content.hover()
    await this.advance(FRAME)
  }

  hoverTestText = async () => {
    await this.testText.hover()
    await this.advance(FRAME)
  }

  focusTrigger = async () => {
    await this.trigger.focus()
    await this.advance(OPEN_DELAY)
  }

  blurTrigger = async () => {
    await this.trigger.evaluate((el) => el.blur())
    await this.advance(FRAME)
  }

  clickMain = async () => {
    await this.page.locator("main").click()
  }

  seeContent = async () => {
    await expect(this.content).toBeVisible()
  }

  dontSeeContent = async () => {
    await expect(this.content).not.toBeVisible()
  }

  // ---------------------------------------------------------------------------
  // Safe area. The corridor is the region between the trigger and the content —
  // the pointer must be able to cross it without the card closing.
  // ---------------------------------------------------------------------------

  private async boxes() {
    const trigger = await this.trigger.boundingBox()
    const content = await this.content.boundingBox()
    if (!trigger || !content) throw new Error("hover card is not open")
    return { trigger, content }
  }

  /** Stop between the trigger and the content, offset sideways so the path is diagonal. */
  moveIntoCorridor = async (offsetX = -25) => {
    const { trigger, content } = await this.boxes()
    const x = trigger.x + trigger.width / 2 + offsetX
    const y = trigger.y + trigger.height + (content.y - (trigger.y + trigger.height)) / 2
    await this.page.mouse.move(x, y, { steps: 5 })
    await this.advance(FRAME)
  }

  moveOntoContent = async () => {
    const { content } = await this.boxes()
    await this.page.mouse.move(content.x + content.width / 2, content.y + 10, { steps: 5 })
    await this.advance(FRAME)
  }

  /** Move away from the content, which must leave the safe area. */
  moveAwayFromContent = async () => {
    const trigger = await this.trigger.boundingBox()
    if (!trigger) throw new Error("no trigger")
    await this.page.mouse.move(trigger.x + trigger.width / 2, Math.max(2, trigger.y - 40), { steps: 5 })
    await this.advance(FRAME)
  }

  /**
   * Somewhere the pointer has no relationship with either element. Measured off the trigger so it
   * works whether or not the card is open, and kept well below it — `mouse.move` interpolates, so
   * a naive path across the page would drag the pointer through the card and engage it.
   */
  moveClearOfCard = async (x = 40) => {
    const trigger = await this.trigger.boundingBox()
    if (!trigger) throw new Error("no trigger")
    await this.page.mouse.move(x, trigger.y + 420, { steps: 3 })
    await this.advance(FRAME)
  }

  /**
   * Hold still for longer than the close delay — the case a plain timer cannot survive. Advanced in
   * two ticks: the exit animation only starts once the close lands, and a frozen clock would never
   * finish an animation that began during the first tick.
   */
  waitOutCloseDelay = async () => {
    await this.advance(CLOSE_DELAY * 2)
    await this.advance(EXIT_ANIMATION)
  }
}
