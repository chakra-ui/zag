import { isArray, isObject, isString } from "@zag-js/utils"
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
