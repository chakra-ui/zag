const elements = new Map<string, HTMLElement>()
const swipingIds = new Set<string>()
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((fn) => fn())
}

export const drawerRegistry = {
  register(id: string, el: HTMLElement) {
    elements.set(id, el)
    notify()
  },
  unregister(id: string) {
    swipingIds.delete(id)
    if (!elements.delete(id)) return
    notify()
  },
  setSwiping(id: string, swiping: boolean) {
    const changed = swiping ? !swipingIds.has(id) : swipingIds.has(id)
    if (!changed) return
    if (swiping) swipingIds.add(id)
    else swipingIds.delete(id)
    notify()
  },
  hasSwipingAfter(id: string) {
    const keys = [...elements.keys()]
    const myIndex = keys.indexOf(id)
    if (myIndex === -1) return false
    return keys.slice(myIndex + 1).some((key) => swipingIds.has(key))
  },
  notify,
  getEntries() {
    return elements
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  },
}
