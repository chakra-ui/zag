import type { Machine as ZagMachine, Transition as ZagTransition } from "@zag-js/core"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Machine extends ZagMachine<any> {
  id: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Transition extends ZagTransition<any> {
  guard?: string
}
