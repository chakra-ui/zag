import { is } from "@core-foundation/utils/is"
import { cast } from "@core-foundation/utils/fn"

import { StateMachine as S } from "./types"

export function toEvent<T extends S.EventObject>(event: S.Event<T>): T {
  const eventObject = is.string(event) ? { type: event } : event
  return cast<T>(eventObject)
}

export const uniqueId = (() => {
  let currentId = 0

  return () => {
    currentId++
    return currentId.toString(16)
  }
})()
