import { expect, describe, it } from "vitest"
import { createMachine } from "../src"

describe("Machine / smoke test", () => {
  it("should work recurring delayed event", () => {
    expect(() => {
      return createMachine({
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
            after: [{ delay: 1000, target: "green" }],
          },
        },
      })
    }).not.toThrow()
  })
})
