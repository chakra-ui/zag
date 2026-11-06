import { expect, type Page } from "@playwright/test"
import { part } from "../_utils"
import { Model } from "./model"

export class ScrollAreaModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  goto(url = "/scroll-area/basic") {
    return this.page.goto(url)
  }

  get viewport() {
    return this.page.locator(part("scroll-area", "viewport"))
  }

  scrollbar(orientation = "vertical") {
    return this.page.locator(`${part("scroll-area", "scrollbar")}[data-orientation=${orientation}]`)
  }

  thumb(orientation = "vertical") {
    return this.page.locator(`${part("scroll-area", "thumb")}[data-orientation=${orientation}]`)
  }

  clickButton(name: string) {
    return this.page.getByRole("button", { name }).click()
  }

  async moveAway() {
    await this.page.mouse.move(5, 700)
  }

  async wheelOver(locator: ReturnType<Page["locator"]>) {
    const box = await locator.boundingBox()
    if (!box) throw new Error("not visible")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await this.page.mouse.wheel(0, 100)
  }

  async pressScrollbarTrack() {
    const box = await this.scrollbar().boundingBox()
    if (!box) throw new Error("no scrollbar")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height - 4)
    await this.page.mouse.down()
    await this.page.mouse.up()
  }

  async startThumbDrag() {
    const box = await this.thumb().boundingBox()
    if (!box) throw new Error("no thumb")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await this.page.mouse.down()
    await this.page.mouse.move(box.x + box.width / 2, box.y + 40, { steps: 4 })
  }

  async seeScrolled() {
    await expect.poll(() => this.viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
  }

  seeScrollSnap(value: string) {
    return expect.poll(() => this.viewport.evaluate((el) => el.style.scrollSnapType)).toBe(value)
  }

  async watchScrolling() {
    await this.scrollbar().evaluate((el) => {
      const w = window as any
      w.__markedScrolling = false
      new MutationObserver(() => {
        if (el.hasAttribute("data-scrolling")) w.__markedScrolling = true
      }).observe(el, { attributes: true })
    })
  }

  seeMarkedScrolling(value: boolean) {
    return expect.poll(() => this.page.evaluate(() => (window as any).__markedScrolling)).toBe(value)
  }

  get corner() {
    return this.page.locator(part("scroll-area", "corner"))
  }

  scrollTop() {
    return this.viewport.evaluate((el) => el.scrollTop)
  }

  scrollLeft() {
    return this.viewport.evaluate((el) => el.scrollLeft)
  }

  maxScrollTop() {
    return this.viewport.evaluate((el) => el.scrollHeight - el.clientHeight)
  }

  async pressTrackAt(fraction: number, button: "left" | "right" = "left") {
    const box = await this.scrollbar().boundingBox()
    if (!box) throw new Error("no scrollbar")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height * fraction)
    await this.page.mouse.down({ button })
    await this.page.mouse.up({ button })
  }

  async dragHorizontalThumb(dx: number) {
    const box = await this.thumb("horizontal").boundingBox()
    if (!box) throw new Error("no thumb")
    const y = box.y + box.height / 2
    await this.page.mouse.move(box.x + box.width / 2, y)
    await this.page.mouse.down()
    await this.page.mouse.move(box.x + box.width / 2 + dx, y, { steps: 5 })
    await this.page.mouse.up()
  }

  async wheelOverScrollbar(deltaY: number, opts: { ctrl?: boolean } = {}) {
    await this.page.evaluate(() => {
      const w = window as any
      w.__wheelPrevented = null
      document.addEventListener("wheel", (e) => (w.__wheelPrevented = e.defaultPrevented), { once: true })
    })
    const box = await this.scrollbar().boundingBox()
    if (!box) throw new Error("no scrollbar")
    await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    if (opts.ctrl) await this.page.keyboard.down("Control")
    await this.page.mouse.wheel(0, deltaY)
    if (opts.ctrl) await this.page.keyboard.up("Control")
    await expect.poll(() => this.page.evaluate(() => (window as any).__wheelPrevented)).not.toBeNull()
    return this.page.evaluate(() => (window as any).__wheelPrevented as boolean)
  }

  async moveWithoutButton() {
    await this.page.evaluate(() => {
      document.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerType: "mouse",
          buttons: 0,
          clientX: 300,
          clientY: 300,
          bubbles: true,
        }),
      )
    })
  }
}
