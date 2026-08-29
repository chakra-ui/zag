import type { Machine } from "@zag-js/core"
import { flushSync, mount, settled, unmount } from "svelte"
import Harness from "./MachineHarness.svelte"
import WatchEffectHarness from "./WatchEffectHarness.svelte"

/** Settles the framework plus the machine's own `queueMicrotask` work (startup, send, restarts). */
export const flush = async () => {
  await settled()
  await Promise.resolve()
  await Promise.resolve()
  await settled()
}

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

interface Tick {
  setProps: (patch: any) => void
  send: (event: any) => void
}

/** Like `renderMachine`, but props can be replaced. Resolves settled, so tests can assert at once. */
export async function renderWithProps(machine: Machine<any>, initial: any = {}) {
  let harness: any
  let props = { ...initial }
  const target = document.createElement("div")

  const app = mount(WatchEffectHarness, {
    target,
    props: { machine, initial: props, onReady: (a: any) => (harness = a) },
  })

  const commit = (next: any) => {
    props = next
    harness.setProps(props)
  }

  const api = {
    get service() {
      return harness.service
    },
    getProps: () => props,
    flush,
    /** Merges into the current props. */
    async setProps(patch: any) {
      commit({ ...props, ...patch })
      await flush()
    },
    async replaceProps(next: any) {
      commit({ ...next })
      await flush()
    },
    async send(event: any) {
      harness.service.send(event)
      await flush()
    },
    /** Runs several changes in one tick. */
    async tick(fn: (t: Tick) => void) {
      fn({
        setProps: (patch: any) => flushSync(() => commit({ ...props, ...patch })),
        send: (event: any) => harness.service.send(event),
      })
      await flush()
    },
    unmount: () => unmount(app),
  }

  await flush()
  return api
}
