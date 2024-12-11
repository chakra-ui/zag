import { describe, expect, it, vi } from "vitest"
import { createMachine } from "../src"

vi.useFakeTimers()

describe("should trigger every actions", () => {
  it("with array notation", () => {
    const counter = createMachine(
      {
        context: { value: 0 },
        initial: "idle",
        states: {
          idle: {
            on: {
              START: { target: "running" },
            },
          },
          running: {
            every: [{ delay: 100, actions: "increment" }],
          },
        },
      },
      {
        actions: {
          increment(ctx) {
            ctx.value++
          },
        },
      },
    )
    counter.start()
    counter.send("START")
    expect(counter.state.context.value).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(counter.state.context.value).toBe(10)
    counter.stop()
  })

  it("with object notation", () => {
    const counter = createMachine(
      {
        context: { value: 0 },
        initial: "idle",
        states: {
          idle: {
            on: {
              START: { target: "running" },
            },
          },
          running: {
            every: {
              100: ["increment"],
            },
          },
        },
      },
      {
        actions: {
          increment(ctx) {
            ctx.value++
          },
        },
      },
    )
    counter.start()
    counter.send("START")
    expect(counter.state.context.value).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(counter.state.context.value).toBe(10)
    counter.stop()
  })
})

describe("after transition", () => {
  it("with named delay", () => {
    const counter = createMachine(
      {
        context: { value: 0 },
        initial: "idle",
        states: {
          idle: {
            on: {
              START: { target: "running" },
            },
          },
          running: {
            after: {
              TIMER_DELAY: { target: "initial" },
            },
          },
          stopped: {},
        },
      },
      {
        delays: {
          TIMER_DELAY: 200,
        },
      },
    )
    counter.start()
    counter.send("START")
    expect(counter.state.context.value).toBe(0)
    vi.advanceTimersByTime(199)
    expect(counter.state.value).toBe("running")
    vi.advanceTimersByTime(1)
    expect(counter.state.value).toBe("initial")
  })
})

it("does not transition into state after options defined timer delay has passed and guard is false", () => {
  const counter = createMachine(
    {
      context: { value: 0 },
      initial: "idle",
      states: {
        idle: {
          on: {
            START: { target: "running" },
          },
        },
        running: {
          every: [{ delay: 100, actions: "increment" }],
          after: {
            TIMER_DELAY: { target: "initial", guard: "isAllowed" },
          },
        },
        stopped: {},
      },
    },
    {
      delays: {
        TIMER_DELAY: 200,
      },
      guards: {
        isAllowed: (ctx) => ctx.value > 5,
      },
      actions: {
        increment(ctx) {
          ctx.value++
        },
      },
    },
  )
  counter.start()
  counter.send("START")
  expect(counter.state.context.value).toBe(0)
  vi.advanceTimersByTime(200)
  // since guard doesn't approve yet
  expect(counter.state.value).toBe("running")
  expect(counter.state.context.value).toBe(2)

  vi.advanceTimersByTime(300)
  // If TIMER_DELAY has passed with guard = false it won't be reevaluated if guard = true?
  expect(counter.state.value).toBe("running")
  counter.stop()
})

it("does transition into state after options defined timer delay has passed and guard is true", () => {
  const counter = createMachine(
    {
      context: { value: 0 },
      initial: "idle",
      states: {
        idle: {
          on: {
            START: { target: "running" },
          },
        },
        running: {
          every: [{ delay: 100, actions: "increment" }],
          after: {
            TIMER_DELAY: { target: "initial", guard: "isAllowed" },
          },
        },
        stopped: {},
      },
    },
    {
      delays: {
        TIMER_DELAY: 200,
      },
      guards: {
        isAllowed: (ctx) => ctx.value > 1,
      },
      actions: {
        increment(ctx) {
          ctx.value++
        },
      },
    },
  )
  counter.start()
  counter.send("START")
  expect(counter.state.context.value).toBe(0)
  vi.advanceTimersByTime(200)
  // guard becomes true and after delay passed
  expect(counter.state.value).toBe("initial")
  expect(counter.state.context.value).toBe(2)
  counter.stop()
})

it("does transition into state after static defined timer delay has passed and guard is true", () => {
  const counter = createMachine(
    {
      context: { value: 0 },
      initial: "idle",
      states: {
        idle: {
          on: {
            START: { target: "running" },
          },
        },
        running: {
          every: [{ delay: 100, actions: "increment" }],
          after: {
            200: { target: "initial", guard: "isAllowed" },
          },
        },
        stopped: {},
      },
    },
    {
      guards: {
        isAllowed: (ctx) => ctx.value > 1,
      },
      actions: {
        increment(ctx) {
          ctx.value++
        },
      },
    },
  )
  counter.start()
  counter.send("START")
  expect(counter.state.context.value).toBe(0)
  vi.advanceTimersByTime(200)
  // guard becomes true and after delay passed
  expect(counter.state.value).toBe("initial")
  expect(counter.state.context.value).toBe(2)
  counter.stop()
})

it("does transition into state after options defined timer delay has passed and guard was true", () => {
  const counter = createMachine(
    {
      context: { value: 0 },
      initial: "idle",
      states: {
        idle: {
          on: {
            START: { target: "running" },
          },
        },
        running: {
          every: [{ delay: 100, actions: "increment" }],
          after: {
            TIMER_DELAY: { target: "initial", guard: "isAllowed" },
          },
        },
        stopped: {},
      },
    },
    {
      delays: {
        TIMER_DELAY: 300,
      },
      guards: {
        isAllowed: (ctx) => ctx.value > 1,
      },
      actions: {
        increment(ctx) {
          ctx.value++
        },
      },
    },
  )
  counter.start()
  counter.send("START")
  expect(counter.state.context.value).toBe(0)
  vi.advanceTimersByTime(200)
  // guard becomes true TIMER_DELAY not done
  expect(counter.state.value).toBe("running")
  expect(counter.state.context.value).toBe(2)

  vi.advanceTimersByTime(100)
  // guard true TIMER_DELAY becomes true
  expect(counter.state.value).toBe("initial")
})
