import { isArray, isObject, isString } from "@zag-js/utils"
import { snapshot, subscribe } from "@zag-js/store"
import type { Dict, StateMachine as S } from "./types"

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

export function subscribeKey<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  fn: (value: T[K]) => void,
  sync?: boolean,
) {
  let prev: any = Reflect.get(snapshot(obj), key)
  return subscribe(
    obj,
    () => {
      const snap = snapshot(obj) as T
      if (!Object.is(prev, snap[key])) {
        fn(snap[key])
        prev = Reflect.get(snap, key)
      }
    },
    sync,
  )
}
