import { expect, type Page } from "@playwright/test"
import { a11y } from "../_utils"
import { Model } from "./model"

const ROOT = "[data-number-flow-root]"
const TRACK = "[data-number-flow-digit-track]"
const VALUE_TEXT = "[data-number-flow-value-text]"

/** How long to allow for a roll to start before concluding this change does not roll. */
const NEVER_ROLLS_MS = 1000

export interface RollReport {
  /** Frames where a digit track scrolled past its last rendered cell, showing nothing. */
  blankFrames: number
  /** Retargets that sent a digit backwards by a whole cycle or more, in cells. */
  backspins: number[]
  /** The digits actually on screen, read off each track's transform. */
  rendered: string
  /** The flattened value the machine reports. */
  label: string
  state: string
}

interface SampleOptions {
  /** Button label to click repeatedly. Omit to only observe. */
  click?: string
  times?: number
  delayMs?: number
  settleMs?: number
}

export class NumberFlowModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  checkAccessibility() {
    return a11y(this.page)
  }

  async goto(url = "/number-flow/basic") {
    await this.page.goto(url)
    // The live region is server-rendered empty and filled by the machine's entry action, so a
    // non-empty one means the client has hydrated. Without this the first click can land on
    // markup that has no handler attached yet, which SSR frameworks lose far more often than
    // Next does.
    await expect(this.page.locator(VALUE_TEXT)).not.toBeEmpty()
  }

  /**
   * Reads the digit each track is *showing* - the cell its transform lands on - rather than the
   * value the machine thinks it has. The two drifting apart is the failure this suite is for.
   */
  private readRendered() {
    return this.page.evaluate(
      ([rootSel, trackSel]) => {
        const el = document.querySelector(rootSel)!
        let out = ""
        for (const child of el.children) {
          if (child.hasAttribute("data-number-flow-symbol")) {
            out += child.textContent
            continue
          }
          const t = child.querySelector(trackSel)
          if (!t) continue
          const cell = t.children[0].getBoundingClientRect().height
          const matrix = new DOMMatrixReadOnly(getComputedStyle(t).transform)
          out += t.children[Math.round(-matrix.m42 / cell)]?.textContent ?? "␀"
        }
        return { rendered: out, label: el.getAttribute("aria-label") ?? "" }
      },
      [ROOT, TRACK] as const,
    )
  }

  async seeRenderedValueMatchesLabel() {
    const { rendered, label } = await this.readRendered()
    expect(rendered).toBe(label)
  }

  async seeValue(value: string) {
    const { rendered, label } = await this.readRendered()
    expect(label).toBe(value)
    expect(rendered).toBe(value)
  }

  seeState(state: "idle" | "rolling") {
    return expect(this.page.locator(ROOT)).toHaveAttribute("data-state", state)
  }

  seeTrend(trend: "up" | "down" | "none") {
    return expect(this.page.locator(ROOT)).toHaveAttribute("data-trend", trend)
  }

  seeAnimationCounts(started: number, completed: number) {
    return this.seeTestIdText("animations", `animations: ${started} started / ${completed} completed`)
  }

  /**
   * Waits for the roll to finish, rather than for a duration long enough to cover it.
   *
   * Waiting on `idle` alone races the roll: the machine transitions a microtask after the
   * event, and only React flushes that synchronously with the click, so `idle` is still true
   * the moment the action returns everywhere else. So latch on `rolling` first, then wait it
   * out. A change that never rolls, under reduced motion or when no digit actually moved,
   * falls through the first wait and settles on the second.
   */
  async waitForSettled() {
    // Latch on `rolling` first. A change that never rolls, under reduced motion or when no
    // digit actually moved, falls through this wait and settles on the next one.
    await this.page
      .waitForFunction(
        ([sel]) => document.querySelector(sel)?.getAttribute("data-state") === "rolling",
        [ROOT] as const,
        { timeout: NEVER_ROLLS_MS },
      )
      .catch(() => {})

    await this.page.waitForFunction(([sel]) => document.querySelector(sel)?.getAttribute("data-state") === "idle", [
      ROOT,
    ] as const)

    // The settle snap and the `idle` attribute land in the same tick, and not every adapter
    // orders them the same way, so give the write one frame to land. Comparing transforms
    // across frames instead would be load-sensitive: a starved frame reads the same value
    // twice mid-roll and looks settled.
    await this.page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))))
  }

  async clickAndSettle(name: string) {
    await this.clickButton(name)
    await this.waitForSettled()
  }

  async clickTestIdAndSettle(id: string) {
    await this.testId(id).click()
    await this.waitForSettled()
  }

  selectPreset(preset: string) {
    return this.controls.select("preset", preset)
  }

  /**
   * Samples every track every frame, optionally clicking a button faster than a roll can
   * finish. That is the case a transition-driven roll gets wrong: targets stack up faster than
   * the browser can reach them, and the strip is finite.
   */
  sample(options: SampleOptions = {}): Promise<RollReport> {
    const { click = "", times = 0, delayMs = 50, settleMs = 8000 } = options
    return this.page.evaluate(
      async ([rootSel, trackSel, label, count, delay, settle]) => {
        const el = document.querySelector(rootSel as string)!
        const tracks = () => [...document.querySelectorAll<HTMLElement>(trackSel as string)]

        const position = (t: Element) => {
          const cell = t.children[0].getBoundingClientRect().height
          return -new DOMMatrixReadOnly(getComputedStyle(t).transform).m42 / cell
        }

        // The inline transform is where the track is heading; the computed one is where it
        // currently is. Both are needed: the target says what the machine asked for, and the
        // gap between them says whether the browser animated there or was snapped.
        const target = (t: HTMLElement) => -Number(/translateY\((-?[\d.]+)lh\)/.exec(t.style.transform)?.[1] ?? NaN)

        type Frame = { pos: number; target: number; cells: number }
        const frames: Record<string, Frame>[] = []
        let sampling = true
        const step = () => {
          if (!sampling) return
          const row: Record<string, Frame> = {}
          for (const t of tracks()) {
            row[t.dataset.place!] = { pos: position(t), target: target(t), cells: t.children.length }
          }
          frames.push(row)
          requestAnimationFrame(step)
        }
        requestAnimationFrame(step)

        if (label) {
          const button = [...document.querySelectorAll("button")].find((b) => b.textContent?.trim() === label)
          if (!button) throw new Error(`no button labelled "${label}"`)
          for (let i = 0; i < (count as number); i++) {
            button.click()
            await new Promise((r) => setTimeout(r, delay as number))
          }
        }
        // After clicking, wait for the roll to actually settle rather than for a duration
        // assumed to cover it - `settle` is only the ceiling. With no clicking this is a plain
        // observation window, which is what the self-driving continuous page wants.
        const deadline = performance.now() + (settle as number)
        if (label) {
          while (performance.now() < deadline) {
            if (el.getAttribute("data-state") === "idle") break
            await new Promise((r) => requestAnimationFrame(r))
          }
          await new Promise((r) => requestAnimationFrame(r))
        } else {
          await new Promise((r) => setTimeout(r, settle as number))
        }
        sampling = false

        let blankFrames = 0
        const backspins: number[] = []

        for (const place of new Set(frames.flatMap((f) => Object.keys(f)))) {
          const series = frames.map((f) => f[place]).filter(Boolean)
          if (!series.length) continue
          const cells = series[series.length - 1].cells

          for (const { pos } of series) {
            if (pos < -0.05 || pos > cells - 1 + 0.05) blankFrames++
          }

          for (let i = 1; i < series.length; i++) {
            const drop = series[i - 1].target - series[i].target
            if (drop < 10) continue
            // The settle reset also moves the target back a whole cycle, but suppresses the
            // transition - the track is already sitting on the new target, having never moved.
            // A real backspin leaves the track behind, with a cycle of travel to animate through.
            if (Math.abs(series[i].pos - series[i].target) < 0.02) continue
            backspins.push(Number(drop.toFixed(2)))
          }
        }

        let rendered = ""
        for (const child of el.children) {
          if (child.hasAttribute("data-number-flow-symbol")) {
            rendered += child.textContent
            continue
          }
          const t = child.querySelector(trackSel as string)
          if (!t) continue
          rendered += t.children[Math.round(position(t))]?.textContent ?? "␀"
        }

        return {
          blankFrames,
          backspins: backspins.filter((b) => b > 0.5),
          rendered,
          label: el.getAttribute("aria-label") ?? "",
          state: el.getAttribute("data-state") ?? "",
        }
      },
      [ROOT, TRACK, click, times, delayMs, settleMs] as const,
    )
  }

  rageClick(name: string, times: number, delayMs = 50) {
    return this.sample({ click: name, times, delayMs })
  }

  /** Every track must always sit on a rendered cell - a blank digit is a hole in the number. */
  seeNoBlankDigits(report: RollReport) {
    expect(report.blankFrames).toBe(0)
  }

  /** A digit may take the short way round, but never spins back through a whole cycle. */
  seeNoFullCycleBackspin(report: RollReport) {
    expect(report.backspins).toEqual([])
  }

  seeSettledOn(report: RollReport) {
    expect(report.state).toBe("idle")
    expect(report.rendered).toBe(report.label)
  }
}
