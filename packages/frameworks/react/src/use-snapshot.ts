// Credits: https://github.com/pmndrs/valtio

import { useCallback, useDebugValue, useEffect, useMemo, useRef } from "react"
import { affectedToPathList, createProxy as createProxyToCompare, isChanged } from "proxy-compare"
import useSyncExternalStoreExports from "use-sync-external-store/shim"
import { snapshot, subscribe } from "@zag-js/store"

const { useSyncExternalStore } = useSyncExternalStoreExports

const __DEV__ = process.env.NODE_ENV !== "production"

interface AsRef {
  $$valtioRef: true
}
type AnyFunction = (...args: any[]) => any
type Snapshot<T> = T extends AnyFunction
  ? T
  : T extends AsRef
  ? T
  : T extends Promise<infer V>
  ? Snapshot<V>
  : {
      readonly [K in keyof T]: Snapshot<T[K]>
    }

const useAffectedDebugValue = (state: object, affected: WeakMap<object, unknown>) => {
  const pathList = useRef<(string | number | symbol)[][]>()
  useEffect(() => {
    pathList.current = affectedToPathList(state, affected)
  })
  useDebugValue(pathList.current)
}

interface Options {
  sync?: boolean
}

export function useSnapshot<T extends object>(proxyObject: T, options?: Options): Snapshot<T> {
  const notifyInSync = options?.sync
  const lastSnapshot = useRef<Snapshot<T>>()
  const lastAffected = useRef<WeakMap<object, unknown>>()
  let inRender = true
  const currSnapshot = useSyncExternalStore(
    useCallback(
      (callback) => {
        const unsub = subscribe(proxyObject, callback, notifyInSync)
        callback() // Note: do we really need this?
        return unsub
      },
      [proxyObject, notifyInSync],
    ),
    () => {
      const nextSnapshot = snapshot(proxyObject)
      try {
        if (
          !inRender &&
          lastSnapshot.current &&
          lastAffected.current &&
          !isChanged(lastSnapshot.current, nextSnapshot, lastAffected.current, new WeakMap())
        ) {
          // not changed
          return lastSnapshot.current
        }
      } catch (e) {
        // ignore if a promise or something is thrown
      }
      return nextSnapshot
    },
    () => snapshot(proxyObject),
  )
  inRender = false
  const currAffected = new WeakMap()
  useEffect(() => {
    lastSnapshot.current = currSnapshot
    lastAffected.current = currAffected
  })

  if (__DEV__) {
    useAffectedDebugValue(currSnapshot, currAffected)
  }

  const proxyCache = useMemo(() => new WeakMap(), []) // per-hook proxyCache
  return createProxyToCompare(currSnapshot, currAffected, proxyCache)
}
