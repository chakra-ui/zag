import { describe, test } from "vitest"
import { createMachine } from "../src"

describe("context watchers", () => {
  test("should watch single key", async () => {
    let called = false

    const machine = createMachine({
      context: {
        value: "4",
      },
      watch: {
        value() {
          called = true
        },
      },

      initial: "idle",
      states: {
        idle: {
          on: {
            UPDATE: {
              actions(ctx) {
                ctx.value = "5"
              },
            },
          },
        },
      },
    })

    machine.start().send("UPDATE")

    await Promise.resolve()

    expect(called).toBe(true)
  })

  test("should watch multiple keys", async () => {
    let called = new Set<string>()

    const machine = createMachine({
      context: {
        value: "4",
        count: 0,
      },
      watch: {
        value() {
          called.add("value")
        },
        count() {
          called.add("count")
        },
      },

      initial: "idle",
      states: {
        idle: {
          on: {
            UPDATE: {
              actions(ctx) {
                ctx.value = "5"
                ctx.count++
              },
            },
          },
        },
      },
    })

    machine.start().send("UPDATE")

    await Promise.resolve()

    expect(called).toMatchInlineSnapshot(`
      Set {
        "value",
        "count",
      }
    `)
  })
})
