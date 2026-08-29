import { useEffect, useLayoutEffect, useState } from "preact/hooks"

interface StoreInstance<T> {
  value: T
  getSnapshot: () => T
}

function didSnapshotChange<T>(inst: StoreInstance<T>): boolean {
  try {
    return !Object.is(inst.value, inst.getSnapshot())
  } catch {
    // a throwing snapshot must force a re-read
    return true
  }
}

/** Not re-exported from `preact/compat`: its copy may call into a different hooks registry. */
export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): T {
  const value = getSnapshot()
  const [{ inst }, forceUpdate] = useState<{ inst: StoreInstance<T> }>({ inst: { value, getSnapshot } })

  useLayoutEffect(() => {
    inst.value = value
    inst.getSnapshot = getSnapshot
    if (didSnapshotChange(inst)) forceUpdate({ inst })
  }, [subscribe, value, getSnapshot])

  useEffect(() => {
    if (didSnapshotChange(inst)) forceUpdate({ inst })
    return subscribe(() => {
      if (didSnapshotChange(inst)) forceUpdate({ inst })
    })
  }, [subscribe])

  return value
}
