import { expect, type Page } from "@playwright/test"
import { Model } from "./model"

const selector = "[data-scope=presence]"

type PresenceEvent = "enter:start" | "enter:cancel" | "exit:start" | "exit:end" | "exit:cancel" | "unmount"

declare global {
  interface Window {
    __presenceEvents: PresenceEvent[]
  }
}

export class PresenceModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  async goto(url = "/presence/basic") {
    await this.page.goto(url)
    await this.trackEvents()
  }

  get content() {
    return this.page.locator(selector)
  }

  get toggle() {
    return this.page.getByRole("button", { name: "Toggle" })
  }

  clickToggle() {
    return this.toggle.click()
  }

  /** Clicks the toggle again `delay` ms after the enter animation starts */
  async closeContentDuringEnter(delay = 50) {
    await this.page.evaluate(
      ({ selector, delay }) => {
        const button = document.querySelector<HTMLButtonElement>("main button")!
        const onStart = (event: AnimationEvent) => {
          if (!(event.target as Element).matches(`${selector}[data-state=open]`)) return
          document.removeEventListener("animationstart", onStart, true)
          setTimeout(() => button.click(), delay)
        }
        document.addEventListener("animationstart", onStart, true)
      },
      { selector, delay },
    )
    await this.clickToggle()
  }

  /** Hides the node (cancelling the exit animation) shortly after the exit animation starts */
  cancelContentExit() {
    return this.page.evaluate((selector) => {
      const onStart = (event: AnimationEvent) => {
        const node = event.target as HTMLElement
        if (!node.matches(`${selector}[data-state=closed]`)) return
        document.removeEventListener("animationstart", onStart, true)
        setTimeout(() => (node.style.display = "none"), 30)
      }
      document.addEventListener("animationstart", onStart, true)
    }, selector)
  }

  toggleRapidly(count: number, interval = 20) {
    return this.page.evaluate(
      async ({ count, interval }) => {
        const button = document.querySelector<HTMLButtonElement>("main button")!
        for (let i = 0; i < count; i++) {
          button.click()
          await new Promise((resolve) => setTimeout(resolve, interval))
        }
      },
      { count, interval },
    )
  }

  private trackEvents() {
    return this.page.evaluate((selector) => {
      window.__presenceEvents = []
      const record = (event: AnimationEvent) => {
        const node = event.target as HTMLElement
        if (!node.matches(selector)) return
        const phase = node.dataset.state === "open" ? "enter" : "exit"
        const kind = event.type.replace("animation", "")
        window.__presenceEvents.push(`${phase}:${kind}` as PresenceEvent)
      }
      for (const type of ["animationstart", "animationend", "animationcancel"]) {
        document.addEventListener(type, record as EventListener, true)
      }
      let mounted = !!document.querySelector(selector)
      new MutationObserver(() => {
        const next = !!document.querySelector(selector)
        if (mounted && !next) window.__presenceEvents.push("unmount")
        mounted = next
      }).observe(document.body, { childList: true, subtree: true })
    }, selector)
  }

  private getEvents() {
    return this.page.evaluate(() => window.__presenceEvents)
  }

  seeContentIsOpen() {
    return expect(this.content).toHaveAttribute("data-state", "open")
  }

  seeContentIsUnmounted() {
    return expect(this.content).toHaveCount(0)
  }

  async seeContentIsMounted(after = 500) {
    await this.page.waitForTimeout(after)
    await expect(this.content).toHaveCount(1)
  }

  /** The exit animation ran to its end before the node was removed */
  async seeContentExitCompleted() {
    await this.seeContentIsUnmounted()
    const events = await this.getEvents()
    expect(events).toContain("exit:end")
    expect(events.indexOf("exit:end")).toBeLessThan(events.indexOf("unmount"))
  }

  /** The exit animation started but was cancelled, and the node was still removed */
  async seeContentExitCancelled() {
    await this.seeContentIsUnmounted()
    const events = await this.getEvents()
    expect(events).toContain("exit:start")
    expect(events).not.toContain("exit:end")
  }
}
