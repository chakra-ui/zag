import { expect, test } from "vitest"
import { determineDelayFn } from "../src/delay-utils"

const context = {
  values: [],
  focusable: true,
  disabled: true,
}

const event = {
  type: "testing",
}

type Context = typeof context

const delaysMap = {
  t1: 200,
  t2: (ctx: Context) => (ctx.values.length === 0 ? 300 : 100),
}

test("should determine delay - t1", () => {
  const fn = determineDelayFn("t1", delaysMap)
  expect(fn(context, event)).toBe(200)
})

test("should determine delay - t2", () => {
  const fn = determineDelayFn("t2", delaysMap)
  expect(fn(context, event)).toBe(300)
})

test("should throw if undefined delay is passed", () => {
  const fn = determineDelayFn("t3", delaysMap)
  expect(() => fn(context, event)).toThrow()
})
