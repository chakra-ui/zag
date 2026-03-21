class DrawerRegistry {
  private readonly elements = new Map<string, HTMLElement>()
  private readonly swipingIds = new Set<string>()
  private readonly swipeProgress = new Map<string, number>()
  private readonly listeners = new Set<() => void>()

  notify() {
    this.listeners.forEach((fn) => fn())
  }

  register(id: string, el: HTMLElement) {
    this.elements.set(id, el)
    this.notify()
  }

  unregister(id: string) {
    this.swipingIds.delete(id)
    this.swipeProgress.delete(id)
    if (!this.elements.delete(id)) return
    this.notify()
  }

  setSwiping(id: string, swiping: boolean) {
    const changed = swiping ? !this.swipingIds.has(id) : this.swipingIds.has(id)
    if (!changed && swiping) return

    if (swiping) {
      this.swipingIds.add(id)
    } else {
      this.swipingIds.delete(id)
      this.swipeProgress.delete(id)
    }

    this.notify()
  }

  setSwipeProgress(id: string, progress: number) {
    this.swipeProgress.set(id, progress)
    this.notify()
  }

  getSwipeProgressAfter(id: string): number {
    const keys = [...this.elements.keys()]
    const myIndex = keys.indexOf(id)
    if (myIndex === -1) return 0

    for (let i = keys.length - 1; i > myIndex; i -= 1) {
      if (this.swipingIds.has(keys[i])) {
        return this.swipeProgress.get(keys[i]) ?? 0
      }
    }

    return 0
  }

  hasSwipingAfter(id: string) {
    const keys = [...this.elements.keys()]
    const myIndex = keys.indexOf(id)
    if (myIndex === -1) return false
    return keys.slice(myIndex + 1).some((key) => this.swipingIds.has(key))
  }

  getEntries() {
    return this.elements
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }
}

export const drawerRegistry = new DrawerRegistry()
