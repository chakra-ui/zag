import type { ActionsOrFn } from "@zag-js/core"
import type { StateDefinition, StateNode, StateTransition } from "./types"
import type { Machine, Transition } from "../../types"
import { findTargetState } from "../machine/state-node"

export const createRootNode = (id: string, machineObj: Machine, initial: string): StateNode => {
  // Create a wrapper state that represents the root
  const rootState = {
    id,
    states: machineObj.states,
    on: machineObj.on,
    entry: machineObj.entry,
    exit: machineObj.exit,
    effects: machineObj.effects,
  }

  const rootNode = createNode({ id, state: rootState, initial })

  // Set machine reference on root node and establish hierarchy
  rootNode.machine = rootNode

  // Set machine reference on all child nodes and establish parent-child relationships
  const setMachineAndParentRefs = (node: StateNode, parent?: StateNode) => {
    node.machine = rootNode
    node.parent = parent
    Object.values(node.states).forEach((child) => setMachineAndParentRefs(child, node))
  }
  setMachineAndParentRefs(rootNode)

  // Now that the hierarchy is established, create transitions
  const createTransitionsForNode = (node: StateNode, stateDefinition: Machine["states"][number]) => {
    node.transitions = createTransitions(stateDefinition, node)
    Object.entries(node.states).forEach(([id, childNode]) => {
      createTransitionsForNode(childNode, machineObj.states[id])
    })
  }
  createTransitionsForNode(rootNode, rootState)

  return rootNode
}

interface CreateNodeProps {
  state: Machine["states"][number] & {
    states?: Record<string, Machine["states"][number]>
    id?: string
  }
  id: string
  initial?: string | null
  order?: number
}

const createNode = ({ state, id, initial = null, order = 0 }: CreateNodeProps): StateNode => {
  const states = state.states ?? {}
  const stateEntries = Object.entries(states)

  const node: StateNode = {
    id,
    key: id,
    initial,
    order,
    tags: state.tags ?? [],
    type: stateEntries.length > 0 ? "compound" : "atomic",
    states: {},
    parent: undefined, // Will be set after creation
    definition: createDefinition(state),
    transitions: [],
    machine: undefined as unknown as StateNode, // Will be set after root node is created
  }

  // Create all states first
  node.states = stateEntries.reduce(
    (acc, [stateId, stateDefinition], index) => {
      const childNode = createNode({
        state: stateDefinition,
        id: `${id}.${stateId}`, // Create hierarchical ID
        order: order + index + 1,
      })
      childNode.key = stateId // Keep original key
      acc[stateId] = childNode
      return acc
    },
    {} as Record<string, StateNode>,
  )

  return node
}

const createDefinition = (state: Machine["states"][number]): StateDefinition => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resolveAction = (action: ActionsOrFn<any> | undefined) => {
    if (!action) return []
    if (typeof action === "function") return ["function"]
    return action
  }

  return {
    entry: resolveAction(state.entry),
    exit: resolveAction(state.exit),
    effect: resolveAction(state.effects),
  }
}

const createTransitions = (state: Machine["states"][number], currentNode: StateNode): StateTransition[] => {
  const transitions: StateTransition[] = []

  const addTransition = (eventType: string, transition: Transition) => {
    // If no target specified, it's a self-transition
    const targetState = transition.target
      ? (findTargetState(currentNode, transition.target) ?? currentNode)
      : currentNode

    if (transition.target && targetState === currentNode) {
      console.warn(
        `Target state "${transition.target}" not found for transition in "${eventType}" from state "${currentNode.id}"`,
        "\nCurrent node:",
        currentNode,
        "\nParent node:",
        currentNode.parent,
      )
      return
    }

    transitions.push({
      eventType,
      actions: typeof transition.actions === "string" ? [transition.actions] : (transition.actions ?? []),
      condition: transition.guard,
      target: targetState,
    })
  }

  const stateOn = state.on ?? {}
  for (const [eventType, transitionData] of Object.entries(stateOn)) {
    if (Array.isArray(transitionData)) {
      transitionData.forEach((transition) => addTransition(eventType, transition))
    } else {
      if (transitionData) addTransition(eventType, transitionData)
    }
  }

  return transitions
}
