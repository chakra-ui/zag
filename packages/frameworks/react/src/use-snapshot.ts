/// <reference types="react/experimental" />

import { Snapshot, snapshot, subscribe } from "@zag-js/store"
import ReactExports, { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react"
import { createProxy as createProxyToCompare, isChanged } from "proxy-compare"

const { use } = ReactExports

type Options = {
  sync?: boolean
}

export function useSnapshot<T extends object>(proxyObject: T, options?: Options): Snapshot<T> {
  const notifyInSync = options?.sync
  const lastSnapshot = useRef<Snapshot<T>>()
  const lastAffected = useRef<WeakMap<object, unknown>>()

  const currSnapshot = useSyncExternalStore(
    useCallback(
      (callback) => {
        const unsub = subscribe(proxyObject, callback, notifyInSync)
        callback()
        return unsub
      },
      [proxyObject, notifyInSync],
    ),
    () => {
      const nextSnapshot = snapshot(proxyObject, use)
      try {
        if (
          lastSnapshot.current &&
          lastAffected.current &&
          !isChanged(lastSnapshot.current, nextSnapshot, lastAffected.current, new WeakMap())
        ) {
          return lastSnapshot.current
        }
      } catch (e) {
        // ignore if a promise or something is thrown
      }
      return nextSnapshot
    },
    () => snapshot(proxyObject, use),
  )
  const currAffected = new WeakMap()
  useEffect(() => {
    lastSnapshot.current = currSnapshot
    lastAffected.current = currAffected
  })
  const proxyCache = useMemo(() => new WeakMap(), []) // per-hook proxyCache
  return createProxyToCompare(currSnapshot, currAffected, proxyCache)
}
