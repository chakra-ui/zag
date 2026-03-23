import type { Machine, MachineSchema, MachineState, TransitionMatch, TransitionMap } from "./types"

const STATE_DELIMITER = "."
const ABSOLUTE_PREFIX = "#"
const stateIndexCache = new WeakMap<object, Map<string, MachineState<any>>>()
const stateIdIndexCache = new WeakMap<object, Map<string, string>>()

function joinStatePath(parts: string[]) {
  return parts.join(STATE_DELIMITER)
}

function isAbsoluteStatePath(value: string) {
  return value.includes(STATE_DELIMITER)
}

function isExplicitAbsoluteStatePath(value: string) {
  return value.startsWith(ABSOLUTE_PREFIX)
}

function isChildTarget(value: string) {
  return value.startsWith(STATE_DELIMITER)
}

function stripAbsolutePrefix(value: string) {
  return isExplicitAbsoluteStatePath(value) ? value.slice(ABSOLUTE_PREFIX.length) : value
}

function appendStatePath(base: string, segment: string) {
  return base ? `${base}${STATE_DELIMITER}${segment}` : segment
}

function buildStateIndex<T extends MachineSchema>(machine: Machine<T>) {
  const index = new Map<string, MachineState<T>>()
  const idIndex = new Map<string, string>()

  const visit = (basePath: string, state: MachineState<T>) => {
    index.set(basePath, state)
    const stateId = state.id
    if (stateId) {
      if (idIndex.has(stateId)) {
        throw new Error(`Duplicate state id: ${stateId}`)
      }
      idIndex.set(stateId, basePath)
    }
    const childStates = state.states
    if (!childStates) return

    for (const [childKey, childState] of Object.entries(childStates)) {
      if (!childState) continue
      const childPath = appendStatePath(basePath, childKey)
      visit(childPath, childState)
    }
  }

  for (const [topKey, topState] of Object.entries(machine.states)) {
    if (!topState) continue
    visit(topKey, topState)
  }

  return { index, idIndex }
}

export function ensureStateIndex<T extends MachineSchema>(machine: Machine<T>) {
  const cached = stateIndexCache.get(machine)
  if (cached) return cached as Map<string, MachineState<T>>

  const { index, idIndex } = buildStateIndex(machine)
  stateIndexCache.set(machine, index as Map<string, MachineState<any>>)
  stateIdIndexCache.set(machine, idIndex)
  return index
}

function getStatePathById<T extends MachineSchema>(machine: Machine<T>, stateId: string) {
  ensureStateIndex(machine)
  return stateIdIndexCache.get(machine)?.get(stateId)
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
  const stateIndex = ensureStateIndex(machine)
  const segments = toSegments(state)

  const chain: StateChain<T> = []
  const statePath: string[] = []

  for (const segment of segments) {
    statePath.push(segment)
    const path = joinStatePath(statePath)
    const current = stateIndex.get(path)
    if (!current) break

    chain.push({ path, state: current })
  }

  return chain
}

function resolveAbsoluteStateValue<T extends MachineSchema>(machine: Machine<T>, value: string): T["state"] {
  const stateIndex = ensureStateIndex(machine)
  const segments = toSegments(value as string)
  if (!segments.length) return value as T["state"]

  const resolved: string[] = []

  for (const segment of segments) {
    resolved.push(segment)
    const path = joinStatePath(resolved)
    if (!stateIndex.has(path)) return value as T["state"]
  }

  let resolvedPath = joinStatePath(resolved)
  let current = stateIndex.get(resolvedPath)
  while (current?.initial) {
    const nextPath = `${resolvedPath}${STATE_DELIMITER}${current.initial as string}`
    const nextState = stateIndex.get(nextPath)
    if (!nextState) break
    resolvedPath = nextPath
    current = nextState
  }

  return resolvedPath as T["state"]
}

function hasStatePath<T extends MachineSchema>(machine: Machine<T>, value: string) {
  const stateIndex = ensureStateIndex(machine)
  return stateIndex.has(value)
}

export function resolveStateValue<T extends MachineSchema>(
  machine: Machine<T>,
  value: T["state"] | string,
  source?: string,
): T["state"] {
  const stateValue = String(value)

  if (isExplicitAbsoluteStatePath(stateValue)) {
    const stateId = stripAbsolutePrefix(stateValue)
    const statePath = getStatePathById(machine, stateId)
    if (!statePath) {
      throw new Error(`Unknown state id: ${stateId}`)
    }
    return resolveAbsoluteStateValue(machine, statePath)
  }

  // Dot-prefixed child target (e.g. ".idle" from source "open" → "open.idle")
  if (isChildTarget(stateValue) && source) {
    const childPath = appendStatePath(source, stateValue.slice(1))
    return resolveAbsoluteStateValue(machine, childPath)
  }

  // Bare name = sibling resolution (aligned with XState/SCXML semantics).
  // Siblings are checked from parent scope upward, never children of the source.
  if (!isAbsoluteStatePath(stateValue) && source) {
    const sourceSegments = toSegments(source)

    // Check siblings (parent scope upward)
    for (let index = sourceSegments.length - 1; index >= 1; index--) {
      const base = sourceSegments.slice(0, index).join(STATE_DELIMITER)
      const candidate = appendStatePath(base, stateValue)
      if (hasStatePath(machine, candidate)) return resolveAbsoluteStateValue(machine, candidate)
    }

    // Check root-level siblings
    if (hasStatePath(machine, stateValue)) return resolveAbsoluteStateValue(machine, stateValue)
  }

  return resolveAbsoluteStateValue(machine, stateValue)
}

export function getStateDefinition<T extends MachineSchema>(machine: Machine<T>, state: T["state"]) {
  const chain = getStateChain(machine, state)
  return chain[chain.length - 1]?.state
}

export function findTransition<T extends MachineSchema>(
  machine: Machine<T>,
  state: T["state"],
  eventType: string,
): TransitionMatch<T> {
  const chain = getStateChain(machine, state)

  for (let index = chain.length - 1; index >= 0; index--) {
    const transitionMap = chain[index]?.state.on as TransitionMap<T> | undefined
    const transition = transitionMap?.[eventType]
    if (transition) return { transitions: transition, source: chain[index]?.path }
  }

  const rootTransitionMap = machine.on as TransitionMap<T> | undefined
  return { transitions: rootTransitionMap?.[eventType], source: undefined }
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
