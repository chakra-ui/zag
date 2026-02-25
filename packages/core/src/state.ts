import type { Machine, MachineSchema, MachineState, Transition } from "./types"

const STATE_DELIMITER = "."

function toSegments(value: string | undefined) {
  if (!value) return []
  return String(value).split(STATE_DELIMITER).filter(Boolean)
}

type StateChain<T extends MachineSchema> = Array<{ path: string; state: MachineState<T> }>

export function getStateChain<T extends MachineSchema>(
  machine: Machine<T>,
  state: T["state"] | undefined,
): StateChain<T> {
  if (!state) return []
  const segments = toSegments(state as string)
  let currentStates: Record<string, MachineState<T>> | undefined = machine.states as any
  const chain: StateChain<T> = []
  const currentPath: string[] = []

  for (const segment of segments) {
    if (!currentStates) break
    const current = currentStates[segment]
    if (!current) break
    currentPath.push(segment)
    chain.push({ path: currentPath.join(STATE_DELIMITER), state: current })
    currentStates = current.states as any
  }

  return chain
}

export function resolveStateValue<T extends MachineSchema>(machine: Machine<T>, value: T["state"]): T["state"] {
  const segments = toSegments(value as string)
  let currentStates: Record<string, MachineState<T>> | undefined = machine.states as any
  let current: MachineState<T> | undefined
  const resolved: string[] = []

  for (const segment of segments) {
    if (!currentStates) break
    const next = currentStates[segment]
    if (!next) return value
    resolved.push(segment)
    current = next
    currentStates = next.states as any
  }

  while (current?.initial && current.states?.[current.initial as string]) {
    resolved.push(current.initial as string)
    current = current.states[current.initial as string]
  }

  return resolved.join(STATE_DELIMITER) as T["state"]
}

export function getStateDefinition<T extends MachineSchema>(machine: Machine<T>, state: T["state"]) {
  const chain = getStateChain(machine, state)
  return chain[chain.length - 1]?.state
}

export function findTransition<T extends MachineSchema>(
  machine: Machine<T>,
  state: T["state"],
  eventType: string,
): Transition<T> | Transition<T>[] | undefined {
  const chain = getStateChain(machine, state)

  for (let index = chain.length - 1; index >= 0; index--) {
    const transition = chain[index]?.state.on?.[eventType]
    if (transition) return transition
  }

  return (machine.on as Record<string, any> | undefined)?.[eventType]
}

export function getExitEnterStates<T extends MachineSchema>(
  machine: Machine<T>,
  prevState: T["state"] | undefined,
  nextState: T["state"],
  reenter?: boolean,
) {
  const prevChain = prevState ? getStateChain(machine, prevState) : []
  const nextChain = getStateChain(machine, nextState)

  let commonIndex = 0

  while (
    commonIndex < prevChain.length &&
    commonIndex < nextChain.length &&
    prevChain[commonIndex]?.path === nextChain[commonIndex]?.path
  ) {
    commonIndex += 1
  }

  let exiting = prevChain.slice(commonIndex).reverse()
  let entering = nextChain.slice(commonIndex)

  const sameLeaf = prevChain.at(-1)?.path === nextChain.at(-1)?.path

  if (reenter && sameLeaf) {
    exiting = prevChain.slice().reverse()
    entering = nextChain
  }

  return { exiting, entering }
}

export function matchesState(current: string | undefined, value: string) {
  if (!current) return false
  return current === value || current.startsWith(`${value}${STATE_DELIMITER}`)
}

export function hasTag<T extends MachineSchema>(machine: Machine<T>, state: T["state"], tag: T["tag"]) {
  return getStateChain(machine, state).some((item) => item.state.tags?.includes(tag))
}
