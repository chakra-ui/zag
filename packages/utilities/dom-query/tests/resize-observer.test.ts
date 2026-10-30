// @vitest-environment jsdom

import { expect, test } from "vitest"
import { resizeObserverBorderBox } from "../src/resize-observer"

test("observe is a no-op when ResizeObserver is unavailable", () => {
  const el = document.createElement("div")
  const stop = resizeObserverBorderBox.observe(el, () => {})
  expect(() => stop()).not.toThrow()
})
