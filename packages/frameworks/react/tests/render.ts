import { act, renderHook } from "@testing-library/react"
import { useMachine } from "../src"

export function renderMachine(machine: any, props?: any) {
  const render = renderHook(() => useMachine<any>(machine, props))
  const send = async (event: any) => {
    await act(async () => render.result.current.send(event))
  }
  const advanceTime = async (ms: number) => {
    await act(async () => vi.advanceTimersByTime(ms))
  }
  return { ...render, send, advanceTime }
}
