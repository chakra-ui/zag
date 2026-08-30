import type { Machine } from "@zag-js/core"
import { createApp, defineComponent, h, nextTick, ref } from "vue"
import { useMachine } from "../src"

/** Settles the framework plus the machine's own `queueMicrotask` work (startup, send, restarts). */
export const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

export function renderMachine(machine: any, props?: any) {
  let current: any
  const root = document.createElement("div")

  const App = defineComponent({
    setup() {
      current = useMachine<any>(machine, props ?? {})
      return () => h("div")
    },
  })

  const app = createApp(App)
  app.mount(root)

  const send = async (event: any) => {
    current.send(event)
    await nextTick()
    await Promise.resolve()
  }

  const advanceTime = async (ms: number) => {
    await vi.advanceTimersByTimeAsync(ms)
    await nextTick()
  }

  return {
    result: {
      get current() {
        return current
      },
    },
    send,
    advanceTime,
    cleanup() {
      app.unmount()
    },
  }
}

interface Tick {
  setProps: (patch: any) => void
  send: (event: any) => void
}

/** Like `renderMachine`, but props can be replaced. Resolves settled, so tests can assert at once. */
export async function renderWithProps(machine: Machine<any>, initial: any = {}) {
  let service: any
  const props = ref({ ...initial })
  const root = document.createElement("div")

  const app = createApp(
    defineComponent({
      setup() {
        service = useMachine<any>(machine, props)
        return () => h("div")
      },
    }),
  )
  app.mount(root)

  const commit = (next: any) => {
    props.value = next
  }

  const api = {
    get service() {
      return service
    },
    getProps: () => props.value,
    flush,
    /** Merges into the current props. */
    async setProps(patch: any) {
      commit({ ...props.value, ...patch })
      await flush()
    },
    async replaceProps(next: any) {
      commit({ ...next })
      await flush()
    },
    async send(event: any) {
      service.send(event)
      await flush()
    },
    /** Runs several changes in one tick. */
    async tick(fn: (t: Tick) => void) {
      fn({
        setProps: (patch: any) => commit({ ...props.value, ...patch }),
        send: (event: any) => service.send(event),
      })
      await flush()
    },
    unmount: () => app.unmount(),
  }

  await flush()
  return api
}
