import { renderHook } from "@solidjs/testing-library"
import type { Machine } from "@zag-js/core"
import { createSignal } from "solid-js"
import { useMachine } from "../src"

/** Settles the framework plus the machine's own `queueMicrotask` work (startup, send, restarts). */
export const flush = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

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

interface Tick {
  setProps: (patch: any) => void
  send: (event: any) => void
}

/** Like `renderMachine`, but props can be replaced. Resolves settled, so tests can assert at once. */
export async function renderWithProps(machine: Machine<any>, initial: any = {}) {
  const [props, setProps] = createSignal<any>({ ...initial })
  const view = renderHook(() => useMachine<any>(machine, props))

  const api = {
    get service() {
      return view.result
    },
    getProps: () => props(),
    flush,
    /** Merges into the current props. */
    async setProps(patch: any) {
      setProps({ ...props(), ...patch })
      await flush()
    },
    async replaceProps(next: any) {
      setProps({ ...next })
      await flush()
    },
    async send(event: any) {
      view.result.send(event)
      await flush()
    },
    /** Runs several changes in one tick. */
    async tick(fn: (t: Tick) => void) {
      fn({
        setProps: (patch: any) => setProps({ ...props(), ...patch }),
        send: (event: any) => view.result.send(event),
      })
      await flush()
    },
    unmount: () => view.cleanup(),
  }

  await flush()
  return api
}
