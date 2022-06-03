import { createMachine } from ".."

const machine = createMachine(
  {
    initial: "unchecked",
    context: {
      hovered: false,
    },
    on: {
      SET_HOVERED: {
        actions: "setHovered",
      },
    },
    states: {
      checked: {
        on: { TOGGLE: { target: "unchecked" } },
      },
      unchecked: {
        on: { TOGGLE: { target: "checked" } },
      },
    },
  },
  {
    actions: {
      setHovered(ctx, evt) {
        ctx.hovered = evt.hovered
      },
    },
  },
)

test("should transition correctly", () => {
  machine.start()
  machine.send({ type: "SET_HOVERED", hovered: true })
  machine.send("TOGGLE")
  machine.send({ type: "SET_HOVERED", hovered: false })
  expect(machine.state.value).toBe("checked")
})
