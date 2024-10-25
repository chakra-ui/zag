import { createMachine } from "../src"

describe("after.test.ts", async () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should transition after delay", () => {
    const lightMachine = createMachine({
      id: "light",
      initial: "green",
      context: {
        canTurnGreen: true,
      },
      states: {
        green: {
          after: {
            1000: "yellow",
          },
        },
        yellow: {
          after: {
            1000: [{ target: "red" }],
          },
        },
        red: {
          after: {
            1000: "green",
          },
        },
      },
    })

    const actorRef = lightMachine.start()
    expect(actorRef.state.matches("green")).toBe(true)

    vi.advanceTimersByTime(500)
    expect(actorRef.state.matches("green")).toBe(true)

    vi.advanceTimersByTime(510)
    expect(actorRef.state.matches("yellow")).toBe(true)
  })

  it("should invoke after transition after evaluating transition", () => {
    let checkedTrue = vi.fn()
    let checkedFalse = vi.fn()

    const machine = createMachine(
      {
        id: "dfd",
        initial: "open",
        states: {
          open: {
            on: {
              HOVER: "opening",
            },
          },
          opening: {
            after: {
              1000: [
                {
                  guard: "isChecked",
                  target: "opening",
                  actions: checkedTrue,
                },
                {
                  target: "opening",
                  actions: checkedFalse,
                },
              ],
            },
            on: {
              LEAVE: "open",
            },
          },
        },
      },
      {
        guards: {
          isChecked: () => true,
        },
      },
    )

    machine.start().send("HOVER")

    vi.advanceTimersByTime(1000)

    expect(checkedTrue).toHaveBeenCalledTimes(1)
  })

  it("should evaluate the expression (string) to determine the delay", async () => {
    const spy = vi.fn()

    const machine = createMachine(
      {
        initial: "inactive",
        states: {
          inactive: {
            on: {
              ACTIVATE: "active",
            },
          },
          active: {
            after: {
              someDelay: "inactive",
            },
          },
        },
      },
      {
        delays: {
          someDelay: (_ctx, event) => {
            spy("called")
            return event.delay
          },
        },
      },
    )

    const actor = machine.start()

    actor.send({ type: "ACTIVATE", delay: 500 })

    await Promise.resolve()

    expect(spy).toBeCalledWith("called")
    expect(actor.state.matches("active")).toBe(true)

    vi.advanceTimersByTime(300)
    expect(actor.state.matches("active")).toBe(true)

    vi.advanceTimersByTime(200)
    expect(actor.state.matches("inactive")).toBe(true)
  })

  it("should evaluate the expression (function) to determine the delay", () => {
    const spy = vi.fn()

    const context = {
      delay: 500,
    }

    const machine = createMachine(
      {
        initial: "inactive",
        context,
        states: {
          inactive: {
            after: {
              myDelay: "active",
            },
          },
          active: {},
        },
      },
      {
        delays: {
          myDelay: (context) => {
            spy(context)
            return context.delay
          },
        },
      },
    )

    const actor = machine.start()

    expect(spy).toBeCalledWith(context)
    expect(actor.state.matches("inactive")).toBe(true)

    vi.advanceTimersByTime(300)
    expect(actor.state.matches("inactive")).toBe(true)

    vi.advanceTimersByTime(200)
    expect(actor.state.matches("active")).toBe(true)
  })

  it("should execute after the max delay value if the over maximum value is specified", () => {
    const machine = createMachine({
      initial: "inactive",
      states: {
        inactive: {
          after: {
            2_147_483_648: "active",
            Infinity: "active",
          },
        },
        active: {},
      },
    })

    const actor = machine.start()
    expect(actor.state.matches("inactive")).toBe(true)

    vi.advanceTimersByTime(100)
    expect(actor.state.matches("inactive")).toBe(true)

    vi.advanceTimersByTime(2_147_483_647 - 100)
    expect(actor.state.matches("active")).toBe(true)
  })
})
