import { createApp, defineComponent, h, nextTick } from "vue"
import { useMachine } from "../src"

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
