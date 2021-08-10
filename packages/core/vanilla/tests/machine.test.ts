import { createMachine } from "../src"

it("should start the service with initial state by default", () => {
  const machine = createMachine<{}, { value: "foo" | "bar" }>({
    initial: "foo",
    states: {
      foo: {
        on: {
          NEXT: "bar",
        },
      },
      bar: {},
    },
  })

  machine.start()

  expect(machine.state.value).toBe("foo")
})

it("should execute initial entry action", () => {
  let executed = false

  const machine = createMachine({
    initial: "foo",
    states: {
      foo: {
        entry: () => {
          executed = true
        },
      },
    },
  })

  machine.start()
  expect(executed).toBe(true)
})

it("should lookup string actions in options", () => {
  let executed = false

  const machine = createMachine(
    {
      initial: "foo",
      states: {
        foo: {
          entry: "testAction",
        },
      },
    },
    {
      actions: {
        testAction: () => {
          executed = true
        },
      },
    },
  )

  machine.start()
  expect(executed).toBe(true)
})

it("should reveal the current state", () => {
  const machine = createMachine({
    initial: "test",
    context: { foo: "bar" },
    states: {
      test: {},
    },
  })

  machine.start()

  expect(machine.state.value).toEqual("test")
  expect(machine.state.context).toEqual({ foo: "bar" })
})

it("should reveal the current state after transition", async () => {
  let done = false
  const machine = createMachine<{ foo: string }, { value: "test" | "success" }>({
    initial: "test",
    context: { foo: "bar" },
    states: {
      test: {
        on: { CHANGE: "success" },
      },
      success: {},
    },
  })

  machine.subscribe((state) => {
    if (state.value === "success") {
      done = true
    }
  })

  machine.start()

  // wait for next tick due to batching
  await machine.send("CHANGE")

  expect(done).toBeTruthy()
})

it("should rehydrate the state and the context if both are provided", () => {
  const machine = createMachine<{ count: number }, { value: "foo" | "bar" | "baz"; tags: "on" | "off" }>({
    initial: "foo",
    states: {
      foo: {
        on: {
          NEXT: "bar",
        },
      },
      bar: {
        on: {
          NEXT: "baz",
        },
      },
      baz: {},
    },
  })

  const context = { count: 1 }
  machine.start({ value: "bar", context })
  expect(machine.state.value).toBe("bar")
  expect(machine.state.context).toEqual(context)

  machine.send("NEXT")
  expect(machine.state.matches("baz")).toBe(true)
})
