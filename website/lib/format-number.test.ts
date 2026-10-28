import { expect, test } from "vitest"
import { formatCompact } from "./format-number"

test("formatCompact shortens large counts the way the proof strip shows them", () => {
  expect(formatCompact(1245934)).toBe("1.2M")
  expect(formatCompact(5240)).toBe("5.2K")
  expect(formatCompact(147)).toBe("147")
  expect(formatCompact(1000)).toBe("1K")
})
