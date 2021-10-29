import { choose } from "../src/action-utils"
import { guards } from "../src/guard-utils"

const { not } = guards

const context = {
  values: [],
  focusable: true,
  disabled: true,
}

const event = {
  type: "testing",
}

type Context = typeof context

const guardMap = {
  isEmpty: (ctx: Context) => ctx.values.length === 0,
  isDisabled: (ctx: Context) => !ctx.focusable && ctx.disabled,
}

it("resolve choose action - false", () => {
  const actions = choose([
    {
      cond: not("isEmpty"),
      actions: ["log"],
    },
    {
      actions: ["test"],
    },
  ])
  const getResult = actions.exec(guardMap)
  expect(getResult(context, event)).toMatchObject(["test"])
})

it("resolve choose action - true", () => {
  const actions = choose([
    {
      cond: "isEmpty",
      actions: ["log"],
    },
    {
      actions: ["test"],
    },
  ])
  const getResult = actions.exec(guardMap)
  expect(getResult(context, event)).toMatchObject(["log"])
})
