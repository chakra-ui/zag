import type { Machine, MachineSchema, MachineState, Transition } from "./types"

const STATE_DELIMITER = "."

function getProp<T>(obj: object | null | undefined, paths: string[]): T | undefined {
  let current: unknown = obj
  for (const key of paths) {
    if (current == null || typeof current !== "object") return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current as T
}

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
  const segments = toSegments(state)

  const chain: StateChain<T> = []
  const pathSegments: string[] = []
  const statePath: string[] = []

  for (const segment of segments) {
    if (pathSegments.length > 0) pathSegments.push("states")
    pathSegments.push(segment)

    const current = getProp<MachineState<T>>(machine.states, pathSegments)
    if (!current) break

    statePath.push(segment)
    chain.push({ path: statePath.join(STATE_DELIMITER), state: current })
  }

  return chain
}

export function resolveStateValue<T extends MachineSchema>(machine: Machine<T>, value: T["state"]): T["state"] {
  const segments = toSegments(value as string)
  const pathSegments: string[] = []
  const resolved: string[] = []

  for (const segment of segments) {
    if (pathSegments.length > 0) pathSegments.push("states")
    pathSegments.push(segment)
    if (!getProp<MachineState<T>>(machine.states, pathSegments)) return value
    resolved.push(segment)
  }

  let current = getProp<MachineState<T>>(machine.states, pathSegments)
  while (current?.initial) {
    pathSegments.push("states", current.initial as string)
    current = getProp<MachineState<T>>(machine.states, pathSegments)
    if (!current) break
    resolved.push(pathSegments[pathSegments.length - 1])
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
    const transition = getProp<Transition<T> | Transition<T>[]>(chain[index], ["state", "on", eventType])
    if (transition) return transition
  }

  return getProp<Transition<T> | Transition<T>[]>(machine, ["on", eventType])
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
