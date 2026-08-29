import { act, render } from "@testing-library/preact"
import { useSyncExternalStore } from "../src"
import { flush } from "./render"

function createStore<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => value,
    set(next: T) {
      value = next
      listeners.forEach((l) => l())
    },
    get listenerCount() {
      return listeners.size
    },
  }
}

describe("preact useSyncExternalStore", () => {
  test("returns the current snapshot", async () => {
    const store = createStore("a")
    let seen: string | undefined
    function Rig() {
      seen = useSyncExternalStore(store.subscribe, store.getSnapshot)
      return null
    }
    render(<Rig />)
    await flush()
    expect(seen).toBe("a")
  })

  test("re-renders when the store notifies with a changed snapshot", async () => {
    const store = createStore("a")
    let renders = 0
    let seen: string | undefined
    function Rig() {
      renders++
      seen = useSyncExternalStore(store.subscribe, store.getSnapshot)
      return null
    }
    render(<Rig />)
    await flush()
    const before = renders

    await act(async () => store.set("b"))
    await flush()

    expect(seen).toBe("b")
    expect(renders).toBeGreaterThan(before)
  })

  test("does not re-render when the snapshot is unchanged", async () => {
    const store = createStore("a")
    let renders = 0
    function Rig() {
      renders++
      useSyncExternalStore(store.subscribe, store.getSnapshot)
      return null
    }
    render(<Rig />)
    await flush()
    const before = renders

    await act(async () => store.set("a"))
    await flush()

    expect(renders).toBe(before)
  })

  test("subscribes once and unsubscribes on unmount", async () => {
    const store = createStore("a")
    function Rig() {
      useSyncExternalStore(store.subscribe, store.getSnapshot)
      return null
    }
    const view = render(<Rig />)
    await flush()
    expect(store.listenerCount).toBe(1)

    await act(async () => {
      view.unmount()
    })
    await flush()
    expect(store.listenerCount).toBe(0)
  })

  test("picks up a snapshot that changed before the subscription was established", async () => {
    const store = createStore("a")
    let seen: string | undefined
    function Rig() {
      seen = useSyncExternalStore(store.subscribe, store.getSnapshot)
      return null
    }
    render(<Rig />)
    ;(store as any).set("b")
    await flush()

    expect(seen).toBe("b")
  })

  test("a throwing getSnapshot forces a re-read rather than wedging", async () => {
    const store = createStore("a")
    let shouldThrow = false
    const getSnapshot = () => {
      if (shouldThrow) throw new Error("boom")
      return store.getSnapshot()
    }
    let seen: string | undefined
    function Rig() {
      seen = useSyncExternalStore(store.subscribe, getSnapshot)
      return null
    }
    render(<Rig />)
    await flush()
    expect(seen).toBe("a")

    shouldThrow = true
    shouldThrow = false
    await act(async () => store.set("c"))
    await flush()
    expect(seen).toBe("c")
  })

  test("tracks a getSnapshot that changes between renders", async () => {
    // without the layout effect, a later notification compares against the previous selector
    let value = { a: 1, b: 10 }
    const listeners = new Set<() => void>()
    const subscribe = (l: () => void) => {
      listeners.add(l)
      return () => listeners.delete(l)
    }
    const set = (next: typeof value) => {
      value = next
      listeners.forEach((l) => l())
    }

    let seen: number | undefined
    function Rig({ pick }: { pick: "a" | "b" }) {
      seen = useSyncExternalStore(subscribe, () => value[pick])
      return null
    }

    const view = render(<Rig pick="a" />)
    await flush()
    expect(seen).toBe(1)

    await act(async () => view.rerender(<Rig pick="b" />))
    await flush()
    expect(seen).toBe(10)

    // only `b` changes; a stale inst would compare `a` and skip the update
    await act(async () => set({ a: 1, b: 20 }))
    await flush()
    expect(seen).toBe(20)
  })
})
