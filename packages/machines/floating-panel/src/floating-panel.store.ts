import { createStore } from "@zag-js/utils"

const store = createStore<{ stack: string[] }>({ stack: [] })

export const panelStack = {
  subscribe: store.subscribe,
  count() {
    return store.get("stack").length
  },
  add(panelId: string) {
    const stack = store.get("stack")
    if (stack.includes(panelId)) return
    store.set("stack", [...stack, panelId])
  },
  remove(panelId: string) {
    const stack = store.get("stack")
    if (!stack.includes(panelId)) return
    store.set(
      "stack",
      stack.filter((id) => id !== panelId),
    )
  },
  bringToFront(panelId: string) {
    const stack = store.get("stack")
    if (stack[stack.length - 1] === panelId) return
    store.set("stack", [...stack.filter((id) => id !== panelId), panelId])
  },
  isTopmost(panelId: string) {
    const stack = store.get("stack")
    return stack[stack.length - 1] === panelId
  },
  indexOf(panelId: string) {
    return store.get("stack").indexOf(panelId)
  },
}
