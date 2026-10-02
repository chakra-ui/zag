import { renderHook } from "@solidjs/testing-library"
import { useMachine } from "../src"

export function renderMachine(machine: any, props?: any) {
  const render = renderHook(() => useMachine<any>(machine, props))
  const send = async (event: any) => {
    render.result.send(event)
    await Promise.resolve()
  }
  const advanceTime = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms)
  }
  return { ...render, send, advanceTime }
}
