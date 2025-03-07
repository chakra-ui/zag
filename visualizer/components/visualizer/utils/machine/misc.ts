import type { StateNode } from "../graph/types"

export const getNextEvents = (machine: StateNode, state: string) => {
  const stateTransitions = machine.states[state].transitions.concat(machine.transitions)
  return stateTransitions.map((t) => t.eventType)
}

export const getNextTransitions = (machine: StateNode, state: string, event: string) => {
  const stateTransitions = machine.states[state].transitions.concat(machine.transitions)
  return stateTransitions.filter((t) => t.eventType === event)
}
