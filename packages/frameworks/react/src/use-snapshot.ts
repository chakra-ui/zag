// Credits: https://github.com/pmndrs/valtio

import { INTERNAL_Snapshot as Snapshot, snapshot, subscribe } from "@zag-js/store"
import { createProxy as createProxyToCompare, getUntracked, isChanged } from "proxy-compare"
import React, { useCallback, useDebugValue, useEffect, useMemo, useRef, useSyncExternalStore } from "react"

//@ts-ignore
const { use } = React

// customized version of affectedToPathList
// we need to avoid invoking getters
const affectedToPathList = (obj: unknown, affected: WeakMap<object, unknown>) => {
  const list: (string | symbol)[][] = []
  const seen = new WeakSet()
  const walk = (x: unknown, path?: (string | symbol)[]) => {
    if (seen.has(x as object)) {
      // for object with cycles
      return
    }
    let used: Set<string | symbol> | undefined
    if (typeof x === "object" && x !== null) {
      seen.add(x)
      used = affected.get(getUntracked(x) || x) as any
    }
    if (used) {
      used.forEach((key) => {
        if ("value" in (Object.getOwnPropertyDescriptor(x, key) || {})) {
          walk((x as any)[key], path ? [...path, key] : [key])
        }
      })
    } else if (path) {
      list.push(path)
    }
  }
  walk(obj)
  return list
}

const useAffectedDebugValue = (state: object, affected: WeakMap<object, unknown>) => {
  const pathList = useRef<(string | number | symbol)[][]>()
  useEffect(() => {
    pathList.current = affectedToPathList(state, affected)
  })
  useDebugValue(pathList.current)
}

type Options = {
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
      const nextSnapshot = snapshot(proxyObject, use)
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
    () => snapshot(proxyObject, use),
  )
  inRender = false
  const currAffected = new WeakMap()
  useEffect(() => {
    lastSnapshot.current = currSnapshot
    lastAffected.current = currAffected
  })
  if (process.env.NODE_ENV !== "production") {
    useAffectedDebugValue(currSnapshot, currAffected)
  }
  const proxyCache = useMemo(() => new WeakMap(), []) // per-hook proxyCache
  return createProxyToCompare(currSnapshot, currAffected, proxyCache)
}
