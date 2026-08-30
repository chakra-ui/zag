import { act, renderHook } from "@testing-library/react"
import type { Machine } from "@zag-js/core"
import { flushSync } from "react-dom"
import { useMachine } from "../src"

/** Settles the framework plus the machine's own `queueMicrotask` work (startup, send, restarts). */
export const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

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

interface Tick {
  setProps: (patch: any) => void
  send: (event: any) => void
}

/** Like `renderMachine`, but props can be replaced. Resolves settled, so tests can assert at once. */
export async function renderWithProps(machine: Machine<any>, initial: any = {}) {
  let props = { ...initial }
  const view = renderHook((p: any) => useMachine<any>(machine, p), { initialProps: props })

  const commit = (next: any) => {
    props = next
    view.rerender(props)
  }

  const api = {
    get service() {
      return view.result.current
    },
    getProps: () => props,
    flush,
    /** Merges into the current props. */
    async setProps(patch: any) {
      await act(async () => commit({ ...props, ...patch }))
      await flush()
    },
    async replaceProps(next: any) {
      await act(async () => commit({ ...next }))
      await flush()
    },
    async send(event: any) {
      await act(async () => view.result.current.send(event))
      await flush()
    },
    /** Runs several changes in one tick. */
    async tick(fn: (t: Tick) => void) {
      fn({
        setProps: (patch: any) => flushSync(() => commit({ ...props, ...patch })),
        send: (event: any) => view.result.current.send(event),
      })
      await flush()
    },
    unmount: () => view.unmount(),
  }

  await flush()
  return api
}
