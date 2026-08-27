// @vitest-environment node

import { createMachine } from "@zag-js/core"
import { render } from "svelte/server"
import MachineHarness from "./MachineHarness.svelte"

test("does not run root exit actions during server rendering", () => {
  const onExit = vi.fn()
  const machine = createMachine<any>({
    initialState() {
      return "idle"
    },
    exit: ["onExit"],
    states: {
      idle: {},
    },
    implementations: {
      actions: {
        onExit,
      },
    },
  })

  void render(MachineHarness, {
    props: {
      machine,
      onReady() {},
    },
  }).body

  expect(onExit).not.toHaveBeenCalled()
})
