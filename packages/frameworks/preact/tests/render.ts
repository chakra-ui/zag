import { act, renderHook } from "@testing-library/preact"
import type { Machine } from "@zag-js/core"
import { useMachine } from "../src"

/** Settles the framework plus the machine's own `queueMicrotask` work (startup, send, restarts). */
export const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

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

interface Tick {
  setProps: (patch: any) => void
  send: (event: any) => void
}

/**
 * Like `renderMachine`, but props can be replaced. Resolves settled, so tests can assert at once.
 *
 * Reads `latest` rather than `view.result.current`: @testing-library/preact does not update
 * `result.current` for the render that `send()` commits inside flushSync from a microtask.
 */
export async function renderWithProps(machine: Machine<any>, initial: any = {}) {
  let latest: any
  let props = { ...initial }
  const view = renderHook(
    (p: any) => {
      latest = useMachine<any>(machine, p)
      return latest
    },
    { initialProps: props },
  )

  const commit = (next: any) => {
    props = next
    view.rerender(props)
  }

  const api = {
    get service() {
      return latest
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
      await act(async () => latest.send(event))
      await flush()
    },
    /** Runs several changes in one tick. */
    async tick(fn: (t: Tick) => void) {
      fn({
        setProps: (patch: any) => commit({ ...props, ...patch }),
        send: (event: any) => latest.send(event),
      })
      await flush()
    },
    unmount: () => view.unmount(),
  }

  await flush()
  return api
}
