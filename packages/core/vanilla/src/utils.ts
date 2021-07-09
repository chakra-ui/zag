import { isString } from "@ui-machines/utils/assertion-utils"
import { cast } from "@ui-machines/utils/function-utils"

import { StateMachine as S } from "./types"

export function toEvent<T extends S.EventObject>(event: S.Event<T>): T {
  const eventObject = isString(event) ? { type: event } : event
  return cast<T>(eventObject)
}

export const uniqueId = (() => {
  let currentId = 0

  return () => {
    currentId++
    return currentId.toString(16)
  }
})()
