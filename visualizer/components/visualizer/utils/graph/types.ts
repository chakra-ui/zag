export type StateDefinition = Partial<Record<"effect" | "entry" | "exit", string[] | { [key: string]: string[] }>>

export interface StateNode {
  /**
   * The unique identifier for this node.
   */
  id: string

  /**
   * The key for this node.
   */
  key: string

  /**
   * The initial state for this node.
   */
  initial?: string | null

  /**
   * An ordered list of possible transitions from this node.
   */
  transitions: StateTransition[]

  /**
   * An array of any child state nodes (sub-states).
   */
  states: Record<string, StateNode>

  /**
   * The position or definition order of this node (e.g., 1, 2, 3).
   */
  order: number

  /**
   * References to invoke, entry, and exit actions.
   * For instance: { name: "onEnter", id: "logEvent" }
   */
  definition: StateDefinition

  /**
   * Any descriptive tags applied to this node.
   */
  tags: string[]

  /**
   * A reference to this node’s parent, if any.
   */
  parent?: StateNode | undefined

  /**
   * The node’s type. Only the root node is typically "compound".
   * Other nodes are "atomic".
   */
  type: "atomic" | "compound"

  /**
   * The machine that contains this node.
   */
  machine: StateNode
}

export interface StateTransition {
  /**
   * The event that triggers this transition.
   */
  eventType: string

  /**
   * A condition or guard to check before this transition is taken.
   */
  condition?: string

  /**
   * A list of actions to perform on transition.
   */
  actions?: string[]

  /**
   * The target state node for this transition.
   */
  target: StateNode
}
