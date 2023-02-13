import { expect, it } from "vitest"
import { choose, guards } from "../src"

const { not } = guards

const context = {
  values: [],
  focusable: true,
  disabled: true,
}

const event = {
  type: "testing",
}

const meta = { state: { matches: () => true } }

type Context = typeof context

const guardMap = {
  isEmpty: (ctx: Context) => ctx.values.length === 0,
  isDisabled: (ctx: Context) => !ctx.focusable && ctx.disabled,
}

it("resolve choose action - false", () => {
  const actions = choose([
    {
      guard: not("isEmpty"),
      actions: ["log"],
    },
    {
      actions: ["test"],
    },
  ])
  const getResult = actions.predicate(guardMap)
  expect(getResult(context, event, meta)).toMatchObject(["test"])
})

it("resolve choose action - true", () => {
  const actions = choose([
    {
      guard: "isEmpty",
      actions: ["log"],
    },
    {
      actions: ["test"],
    },
  ])
  const getResult = actions.predicate(guardMap)
  expect(getResult(context, event, meta)).toMatchObject(["log"])
})
