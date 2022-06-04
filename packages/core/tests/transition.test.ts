import { createMachine } from ".."

function getMachine(debug?: boolean) {
  const checked = { entry: jest.fn(), exit: jest.fn() }
  const unchecked = { entry: jest.fn(), exit: jest.fn() }

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
        CHECK: {
          target: "checked",
          internal: true,
        },
        UNCHECK: "unchecked",
      },
      states: {
        checked: {
          entry: [checked.entry],
          exit: [checked.exit],
          on: {
            TOGGLE: {
              target: "unchecked",
            },
          },
        },
        unchecked: {
          entry: [unchecked.entry],
          exit: [unchecked.exit],
          on: {
            TOGGLE: {
              target: "checked",
            },
          },
        },
      },
    },
    {
      debug,
      actions: {
        setHovered(ctx, evt) {
          ctx.hovered = evt.hovered
        },
      },
    },
  )

  return { machine, checked, unchecked }
}

test("should transition correctly", () => {
  const { machine } = getMachine()
  machine.start()
  machine.send({ type: "SET_HOVERED", hovered: true })
  machine.send("TOGGLE")
  machine.send({ type: "SET_HOVERED", hovered: false })
  expect(machine.state.value).toBe("checked")
})

test("should resolve internal self transition correctly", () => {
  const { machine, checked } = getMachine()
  machine.start()
  machine.send("CHECK")
  expect(checked.entry).toHaveBeenCalledTimes(1)
  machine.send("CHECK")
  expect(checked.entry).toHaveBeenCalledTimes(1)
})

test("should resolve external self transition correctly", () => {
  const { machine, unchecked } = getMachine()
  machine.start()
  expect(unchecked.entry).toHaveBeenCalledTimes(1)
  machine.send("CHECK")
  expect(unchecked.exit).toHaveBeenCalledTimes(1)
  machine.send("UNCHECK")
  expect(unchecked.entry).toHaveBeenCalledTimes(2)
  machine.send("UNCHECK")
  expect(unchecked.exit).toHaveBeenCalledTimes(2)
  expect(unchecked.entry).toHaveBeenCalledTimes(3)
})
