import { expect, describe, it } from "vitest"
import { createMachine } from "../src"

describe("tags", () => {
  it("supports tagging states", () => {
    const machine = createMachine({
      initial: "green",
      states: {
        green: {
          tags: ["go"],
        },
        yellow: {
          tags: ["go"],
          on: {
            TIMER: "red",
          },
        },
        red: {
          tags: ["stop"],
        },
      },
    })

    machine.start()
    expect(machine.state.hasTag("go")).toBeTruthy()
    machine.transition("yellow", "TIMER")
    expect(machine.state.hasTag("go")).toBeFalsy()
  })

  it("tags can be single (not array)", () => {
    const machine = createMachine({
      initial: "green",
      states: {
        green: {
          tags: "go",
        },
      },
    })

    machine.start()
    expect(machine.state.hasTag("go")).toBeTruthy()
  })
})
