import { is } from "tiny-guard"
import type { StateMachine as S } from "./types"

export function toEvent<T extends S.EventObject>(event: S.Event<T>): T {
  const obj = is.str(event) ? { type: event } : event
  return obj as T
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return is.arr(value) ? value : [value]
}

export const uniqueId = (() => {
  let id = 0
  return () => {
    id++
    return id.toString(16)
  }
})()
