import { isArray, isString } from "../../utils/guard"
import type { StateMachine as S } from "./types"

export function toEvent<T extends S.EventObject>(event: S.Event<T>): T {
  const obj = isString(event) ? { type: event } : event
  return obj as T
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return isArray(value) ? value : [value]
}

export const uniqueId = (() => {
  let id = 0
  return () => {
    id++
    return id.toString(16)
  }
})()
