import type { Page } from "@playwright/test"

// Keep browser input, tasks and microtasks running while holding rendering callbacks.
// Arm this after focusing the trigger: locator actionability itself needs frames.
export async function holdFrames(page: Page) {
  await page.evaluate(() => {
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)
    const pending = new Map<number, { callback: FrameRequestCallback; frame?: number }>()
    let held = true
    let id = 0

    const schedule = (id: number, entry: { callback: FrameRequestCallback; frame?: number }) => {
      entry.frame = request((time) => {
        pending.delete(id)
        entry.callback(time)
      })
    }

    window.requestAnimationFrame = (callback) => {
      // Negative ids cannot collide with native frames queued before the hold.
      const next = --id
      const entry = { callback }
      pending.set(next, entry)
      if (!held) schedule(next, entry)
      return next
    }
    window.cancelAnimationFrame = (id) => {
      const entry = pending.get(id)
      if (entry?.frame !== undefined) cancel(entry.frame)
      else if (id >= 0) cancel(id)
      pending.delete(id)
    }
    Object.assign(window, {
      releaseFrames() {
        if (!held) return
        held = false
        pending.forEach((entry, id) => schedule(id, entry))
        // Keep translating ids so cleanup can cancel a frame even after its release.
      },
    })
  })
}

export async function releaseFrames(page: Page) {
  await page.evaluate(() => (window as any).releaseFrames())
}
