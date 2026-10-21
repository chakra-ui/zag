/** The selected trigger is independent of whether its DOM node is currently mounted. */
export interface DismissableTrigger {
  getId(): string | null
  getElement(): HTMLElement | null
  setId(id: string | null): void
  /** Consume an explicit selection that has not yet been used by an active layer. */
  takePendingId(): string | null
  subscribe(listener: VoidFunction): VoidFunction
}

/** Track intentional trigger selection without relying on DOM mutations. */
export function createDismissableTrigger(
  getById: (id: string) => HTMLElement | null,
  initialId: string | null = null,
): DismissableTrigger {
  let id = initialId
  let pending = initialId !== null
  const listeners = new Set<VoidFunction>()
  return {
    getId: () => id,
    getElement: () => (id === null ? null : getById(id)),
    takePendingId() {
      const selected = pending ? id : null
      pending = false
      return selected
    },
    setId(nextId) {
      id = nextId
      pending = true
      for (const listener of [...listeners]) {
        if (listeners.has(listener)) listener()
      }
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
