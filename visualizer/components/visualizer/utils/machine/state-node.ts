import type { StateNode } from "../graph/types"
import { ELSE_GUARD } from "./serialize"

export type ConditionalActions = Record<string, string[]>

/**
 * Checks if a value represents conditional actions (from choose call expression)
 */
export function isConditionalActions(value: unknown): value is ConditionalActions {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Format conditional actions for display
 * @returns Array of [condition, actions[]] pairs, with else condition at the end if present
 */
export function formatConditionalActions(actions: ConditionalActions): [string, string[]][] {
  const entries = Object.entries(actions)
  // Sort to ensure else_guard is always last
  return entries
    .sort(([a], [b]) => {
      if (a === ELSE_GUARD) return 1
      if (b === ELSE_GUARD) return -1
      return 0
    })
    .map(([condition, actions]) => [condition === ELSE_GUARD ? "else" : condition, actions])
}

/**
 * Checks if a state node is active in the current machine state
 */
export function isStateNodeActive(stateNode: StateNode, machineId: string, machineState: string): boolean {
  return [machineId, machineState].includes(stateNode.key)
}

/**
 * Finds a target state by ID in the state hierarchy
 */
export function findTargetState(currentNode: StateNode, targetId: string): StateNode | undefined {
  // Check in current node's states (for parent -> child transitions)
  if (currentNode.states[targetId]) {
    return currentNode.states[targetId]
  }

  // Check in parent's states (for sibling transitions)
  if (currentNode.parent?.states[targetId]) {
    return currentNode.parent.states[targetId]
  }

  // Check in parent's parent states (for uncle transitions)
  if (currentNode.parent?.parent?.states[targetId]) {
    return currentNode.parent.parent.states[targetId]
  }

  // If we're in a child state, check the root node's states
  let node = currentNode
  while (node.parent) {
    node = node.parent
  }

  return node.states[targetId]
}

/**
 * Gets all ancestors of a state node up to the root
 */
export function getStateNodeAncestors(node: StateNode): Set<StateNode> {
  const ancestors = new Set<StateNode>()
  let current = node
  while (current) {
    ancestors.add(current)
    if (!current.parent) break
    current = current.parent
  }
  return ancestors
}

/**
 * Type guard to check if a node is a compound state
 */
export function isCompoundState(node: StateNode): boolean {
  return node.type === "compound"
}

/**
 * Gets the root machine node from any state node
 */
export function getRootMachineNode(node: StateNode): StateNode {
  let current = node
  while (current.parent) {
    current = current.parent
  }
  return current
}
