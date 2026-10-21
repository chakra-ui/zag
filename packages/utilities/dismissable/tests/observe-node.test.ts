// @vitest-environment jsdom

import { afterEach, expect, test, vi } from "vitest"
import { observeNode } from "../src/observe-node"

const tick = () => new Promise((resolve) => setTimeout(resolve))

afterEach(() => {
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

test("retries a failed attach on the next mutation", async () => {
  // The shared observer reports listener errors on a microtask; capture them instead.
  const errors: unknown[] = []
  vi.spyOn(document.defaultView!, "queueMicrotask").mockImplementation((fn) => {
    try {
      fn()
    } catch (error) {
      errors.push(error)
    }
  })

  let node: HTMLElement | null = null
  let fail = true
  const attach = vi.fn(() => {
    if (fail) throw new Error("attach failed")
    return () => {}
  })
  const stop = observeNode(() => node, { attach })

  node = document.createElement("div")
  document.body.append(node)
  await tick()
  expect(attach).toHaveBeenCalledTimes(1)
  expect(errors).toHaveLength(1)

  fail = false
  document.body.append(document.createElement("span"))
  await tick()
  expect(attach).toHaveBeenCalledTimes(2)
  expect(attach).toHaveBeenLastCalledWith(node)
  stop()
})
