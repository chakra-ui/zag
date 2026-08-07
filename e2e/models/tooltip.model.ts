import { expect, type Page } from "@playwright/test"
import { a11y, testid } from "../_utils"
import { Model } from "./model"

// machine defaults
export const OPEN_DELAY = 400
export const CLOSE_DELAY = 150
/** Enough to flush the safe area tracker's coalescing animation frame. */
const FRAME = 32
/** The example's exit keyframes, which keep the node visible until they finish. */
const EXIT_ANIMATION = 200

export class TooltipModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page, "main")
  }

  private clockInstalled = false

  /**
   * Time is driven explicitly via `page.clock` rather than slept through, so the open and close
   * delays are deterministic instead of races.
   */
  async goto(url = "/tooltip/basic") {
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

  /**
   * Hold still for longer than the close delay — the case a plain timer cannot survive. Advanced in
   * two ticks: the exit animation only starts once the close lands, and a frozen clock would never
   * finish an animation that began during the first tick.
   */
  waitOutCloseDelay = async () => {
    await this.advance(CLOSE_DELAY * 4)
    await this.advance(EXIT_ANIMATION)
  }

  private getTrigger(id: string) {
    return this.page.locator(testid(id + "-trigger"))
  }

  private getContent(id: string) {
    return this.page.locator(testid(id + "-tooltip"))
  }

  hoverTrigger = async (id: string, opts: { wait?: boolean } = {}) => {
    const { wait = true } = opts
    await this.getTrigger(id).hover()
    await this.advance(wait ? OPEN_DELAY : FRAME)
  }

  hoverOutside = async () => {
    await this.page.mouse.move(0, 0)
    await this.advance(FRAME)
  }

  seeContent = async (id: string) => {
    await expect(this.getContent(id)).toBeVisible()
  }

  dontSeeContent = async (id: string) => {
    await expect(this.getContent(id)).not.toBeVisible()
  }

  focusPage = async () => {
    await this.page.locator("main").click()
  }

  focusTrigger = async (id: string) => {
    await this.getTrigger(id).focus()
    await this.advance(OPEN_DELAY)
  }

  pointerdownTrigger = async (id: string) => {
    await this.getTrigger(id).dispatchEvent("pointerdown", { button: 0 })
  }

  seeTriggerIsFocused = async (id: string) => {
    await expect(this.getTrigger(id)).toBeFocused()
  }

  // ---------------------------------------------------------------------------
  // Safe area, for `interactive` tooltips. The pointer must be able to cross the
  // gap to a hoverable tooltip without it closing (WCAG 1.4.13).
  // ---------------------------------------------------------------------------

  get sibling() {
    return this.page.locator(testid("sibling"))
  }

  private async boxes(id: string) {
    const trigger = await this.getTrigger(id).boundingBox()
    const content = await this.getContent(id).boundingBox()
    if (!trigger || !content) throw new Error("tooltip is not open")
    return { trigger, content }
  }

  /** Stop in the gutter between the trigger and the tooltip, offset sideways. */
  moveIntoCorridor = async (id: string, offsetX = -8) => {
    const { trigger, content } = await this.boxes(id)
    const x = trigger.x + trigger.width / 2 + offsetX
    const y = trigger.y + trigger.height + (content.y - (trigger.y + trigger.height)) / 2
    await this.page.mouse.move(x, y, { steps: 5 })
    await this.advance(FRAME)
  }

  moveOntoContent = async (id: string) => {
    const { content } = await this.boxes(id)
    await this.page.mouse.move(content.x + content.width / 2, content.y + 10, { steps: 5 })
    await this.advance(FRAME)
  }

  /** Move away from the tooltip, which must leave the safe area. */
  moveAwayFromContent = async (id: string) => {
    const trigger = await this.getTrigger(id).boundingBox()
    if (!trigger) throw new Error("no trigger")
    await this.page.mouse.move(trigger.x + trigger.width / 2, Math.max(2, trigger.y - 40), { steps: 5 })
    await this.advance(FRAME)
  }

  hoverSibling = async () => {
    await this.sibling.hover()
    await this.advance(FRAME)
  }

  blurTrigger = async (id: string) => {
    await this.getTrigger(id).evaluate((el) => (el as HTMLElement).blur())
    await this.advance(FRAME)
  }

  seeContentIsHoverable = async (id: string) => {
    await expect(this.getContent(id)).toHaveCSS("pointer-events", "auto")
  }
}
