import { guards } from "../src/guard-utils"
const { or, not, and } = guards

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

it("or", () => {
  const getResult = or("isEmpty", "isDisabled").exec(guardMap)
  expect(getResult(context, event)).toBeTruthy()
})

it("not", () => {
  const getResult = not("isEmpty").exec(guardMap)
  expect(getResult(context, event)).toBeFalsy()
})

it("and", () => {
  const getResult = and("isEmpty", "isDisabled").exec(guardMap)
  expect(getResult(context, event)).toBeFalsy()
})

it("combinations", () => {
  const getResult = and("isEmpty", not("isDisabled")).exec(guardMap)
  expect(getResult(context, event)).toBeTruthy()

  const getResult2 = not(and("isEmpty", "isDisabled")).exec(guardMap)
  expect(getResult2(context, event)).toBeTruthy()
})
