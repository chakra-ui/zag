import { createMachine, guards } from "../src"

const { isIn } = guards

type Context = {
  count: number
}
type State = {
  value: "open" | "closed"
}

const service = createMachine<Context, State>({
  initial: "open",
  context: { count: 0 },
  on: {
    CHECK: {
      guard: isIn("open"),
      actions: (ctx) => ctx.count++,
    },
  },
  states: {
    open: {
      on: {
        TOGGLE: "closed",
      },
    },
    closed: {
      on: {
        TOGGLE: "open",
      },
    },
  },
})

test("should work with 'in' guard", () => {
  service.start().send("TOGGLE")
  expect(service.state.value).toBe("closed")

  service.send("CHECK")
  expect(service.state.context.count).toBe(0)

  service.send("TOGGLE")
  expect(service.state.value).toBe("open")

  service.send("CHECK")
  expect(service.state.context.count).toBe(1)
})
