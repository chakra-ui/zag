import { mount, settled, unmount } from "svelte"
import Harness from "./MachineHarness.svelte"

export function renderMachine(machine: any, machineProps?: any) {
  let current: any
  const target = document.createElement("div")

  const app = mount(Harness, {
    target,
    props: {
      machine,
      machineProps,
      onReady(service: any) {
        current = service
      },
    },
  })

  const mounted = settled()

  const send = async (event: any) => {
    await mounted
    current.send(event)
    await settled()
    await Promise.resolve()
  }

  const advanceTime = async (ms: number) => {
    await mounted
    await vi.advanceTimersByTimeAsync(ms)
    await settled()
  }

  return {
    result: {
      get current() {
        return current
      },
    },
    send,
    advanceTime,
    cleanup: async () => {
      await unmount(app)
    },
  }
}
