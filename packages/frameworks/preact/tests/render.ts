import { act, renderHook } from "@testing-library/preact"
import { useMachine } from "../src"

export function renderMachine(machine: any, machineProps?: any) {
  const render = renderHook(() => useMachine<any>(machine, machineProps))

  const send = async (event: any) => {
    await act(async () => {
      render.result.current.send(event)
    })
    await Promise.resolve()
  }

  const advanceTime = async (ms: number) => {
    await act(async () => {
      vi.advanceTimersByTime(ms)
    })
    await Promise.resolve()
  }

  return {
    ...render,
    send,
    advanceTime,
    cleanup: async () => {
      await act(async () => {
        render.unmount()
      })
    },
  }
}
