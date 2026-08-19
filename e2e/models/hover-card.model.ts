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

  hoverTrigger = async (opts: { wait?: boolean } = {}) => {
    const { wait = true } = opts
    await this.trigger.hover()
    await this.advance(wait ? OPEN_DELAY : FRAME)
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

  /** A pointer press well clear of the trigger, to establish pointer modality. */
  pressAway = async () => {
    await this.page.mouse.move(600, 600)
    await this.page.mouse.down()
    await this.page.mouse.up()
    await this.advance(FRAME)
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

  // ---------------------------------------------------------------------------
  // Open-change reasons, recorded by the controlled example
  // ---------------------------------------------------------------------------

  seeOpenChangeLog = async (expected: string) => {
    await expect(this.page.locator(testid("reason-log"))).toHaveText(expected)
  }

  pressOutside = async () => {
    await this.page.mouse.move(400, 30)
    await this.page.mouse.down()
    await this.page.mouse.up()
    await this.advance(FRAME)
  }

  // ---------------------------------------------------------------------------
  // Inline anchoring, for a trigger that wraps across lines
  // ---------------------------------------------------------------------------

  get wrappedTrigger() {
    return this.page.locator(testid("wrapped-trigger"))
  }

  get positioner() {
    return this.page.locator(part("hover-card", "positioner"))
  }

  triggerLines = async () => {
    return this.wrappedTrigger.evaluate((el) =>
      Array.from(el.getClientRects()).map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })),
    )
  }

  hoverLine = async (index: number) => {
    const lines = await this.triggerLines()
    const line = lines[index]
    if (!line) throw new Error(`trigger has no line ${index}`)
    await this.page.mouse.move(line.x + line.width / 2, line.y + line.height / 2, { steps: 8 })
    await this.advance(OPEN_DELAY)
    return line
  }

  /** Below every line, so leaving crosses nothing. */
  moveClearOfParagraph = async () => {
    await this.page.mouse.move(5, 600, { steps: 4 })
    await this.advance(FRAME)
  }

  otherTriggerLines = async () => {
    return this.page
      .locator(testid("wrapped-trigger-2"))
      .evaluate((el) =>
        Array.from(el.getClientRects()).map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })),
      )
  }

  switchTrigger = async () => {
    await this.page.locator(testid("switch-trigger")).click()
    await this.advance(FRAME)
  }

  dontSeeCardAnchoredTo = async (line: { x: number; y: number; width: number; height: number }) => {
    const box = await this.positioner.boundingBox()
    if (!box) throw new Error("hover card is not open")
    expect(Math.abs(box.y - (line.y + line.height))).toBeGreaterThan(40)
  }

  seeCardAnchoredTo = async (line: { x: number; y: number; width: number; height: number }) => {
    const box = await this.positioner.boundingBox()
    if (!box) throw new Error("hover card is not open")
    // Centred on the hovered line, not on the union.
    expect(box.y).toBeGreaterThanOrEqual(line.y + line.height)
    expect(box.y).toBeLessThan(line.y + line.height + 40)
    expect(Math.abs(box.x + box.width / 2 - (line.x + line.width / 2))).toBeLessThan(40)
  }
}
