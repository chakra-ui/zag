import { expect, test, vi } from "vitest"
import { createMachine } from "../src"

test("[final state] exit actions should be called when invoked machine reaches its final state", () => {
  const exit_root = vi.fn()
  const exit_state = vi.fn()

  let done = vi.fn()

  const machine = createMachine({
    exit: exit_root,
    initial: "a",
    states: {
      a: {
        type: "final",
        exit: exit_state,
      },
    },
  })

  machine
    .onDone(() => {
      done()
    })
    .start()

  expect(exit_root).toHaveBeenCalled()
  expect(exit_state).toHaveBeenCalled()
  expect(done).toHaveBeenCalled()
})

test("exit actions should be called when stopping a machine", () => {
  const exit_root = vi.fn()
  const exit_state = vi.fn()

  const machine = createMachine({
    exit: exit_root,
    initial: "a",
    states: {
      a: {
        exit: exit_state,
      },
    },
  })

  machine.start().stop()

  expect(exit_root).toBeTruthy()
  expect(exit_state).toBeTruthy()
})
