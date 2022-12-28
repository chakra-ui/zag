import { snapshot, subscribe } from "@zag-js/store"
import { isArray, isObject, isString } from "@zag-js/utils"
import { klona as klonaFull } from "klona/full"
import { klona as klonaJson } from "klona/json"
import type { CompareFn, Dict, StateMachine as S } from "./types"

export function cloneJson<T>(v: T): T {
  return klonaJson(v)
}

export function cloneFull<T>(v: T): T {
  return klonaFull(v)
}

export function toEvent<T extends S.EventObject>(event: S.Event<T>): T {
  const obj = isString(event) ? { type: event } : event
  return obj as T
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return isArray(value) ? value.slice() : [value]
}

export function isGuardHelper(value: any): value is { predicate: (guards: Dict) => any } {
  return isObject(value) && value.predicate != null
}

const defaultCompareFn: CompareFn = (prev, next) => Object.is(prev, next)

export function subscribeKey<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  fn: (value: T[K]) => void,
  sync?: boolean,
  compareFn?: (prev: T[K], next: T[K], key: string) => boolean,
) {
  let prev: any = Reflect.get(snapshot(obj), key)
  const isEqual = compareFn || defaultCompareFn
  return subscribe(
    obj,
    function onSnapshotChange() {
      const snap = snapshot(obj) as T
      if (!isEqual(prev, snap[key], key as string)) {
        fn(snap[key])
        prev = Reflect.get(snap, key)
      }
    },
    sync,
  )
}
