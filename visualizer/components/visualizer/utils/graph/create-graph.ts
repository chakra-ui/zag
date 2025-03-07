import type { StateNode, StateTransition } from "./types"
import type { Point } from "@zag-js/rect-utils"
import type { ElkExtendedEdge } from "elkjs"

export type DirectedGraphLabel = {
  text: string
  x: number
  y: number
}

export type DirectedGraphPort = {
  id: string
}

export type DirectedGraphEdgeConfig = {
  id: string
  source: StateNode
  target: StateNode
  label: DirectedGraphLabel
  transition: StateTransition
  sections: ElkExtendedEdge["sections"]
}

export type DirectedGraphNodeConfig = {
  id: string
  stateNode: StateNode
  children: DirectedGraphNode[]
  ports: DirectedGraphPort[]
  /**
   * The edges representing all transitions from this `stateNode`.
   */
  edges: DirectedGraphEdge[]
}

export type NodeLayout = {
  x: number
  y: number
  width: number
  height: number
}

export class DirectedGraphNode {
  public id: string
  public data: StateNode
  public children: DirectedGraphNode[]
  public ports: DirectedGraphPort[]
  public edges: DirectedGraphEdge[]

  /**
   * The position of the graph node (relative to parent)
   * and its dimensions
   */
  public layout?: NodeLayout

  /**
   * Gets the absolute position of the graph node
   */
  public get absolute(): Point | undefined {
    if (!this.layout) return undefined
    if (!this.parent) return this.layout
    const parentPos = this.parent.absolute
    if (!parentPos) return undefined

    return {
      x: this.layout.x + parentPos.x,
      y: this.layout.y + parentPos.y,
    }
  }

  constructor(
    config: DirectedGraphNodeConfig,
    public parent?: DirectedGraphNode,
  ) {
    this.id = config.id
    this.data = config.stateNode
    this.children = config.children
    this.children.forEach((child) => {
      child.parent = this
    })
    this.ports = config.ports
    this.edges = config.edges.map((edgeConfig) => new DirectedGraphEdge(edgeConfig))
  }

  public get level(): number {
    return (this.parent?.level ?? -1) + 1
  }
}

export class DirectedGraphEdge {
  public id: string
  public source: StateNode
  public target: StateNode
  public label: DirectedGraphLabel
  public transition: StateTransition
  public sections: ElkExtendedEdge["sections"]

  constructor({ id, source, target, label, transition, sections }: DirectedGraphEdgeConfig) {
    this.id = id
    this.source = source
    this.target = target
    this.label = label
    this.transition = transition
    this.sections = sections
  }

  /**
   * Checks if this edge points back to its source node
   */
  public get isLoop(): boolean {
    return this.source === this.target
  }

  /**
   * Updates the sections of this edge with translated coordinates
   */
  public updateSectionsWithTranslation(sections: ElkExtendedEdge["sections"], translation: Point): void {
    if (!sections) {
      this.sections = []
      return
    }

    this.sections = sections.map((section) => ({
      ...section,
      startPoint: {
        x: section.startPoint.x + translation.x,
        y: section.startPoint.y + translation.y,
      },
      endPoint: {
        x: section.endPoint.x + translation.x,
        y: section.endPoint.y + translation.y,
      },
      bendPoints:
        section.bendPoints?.map((point) => ({
          x: point.x + translation.x,
          y: point.y + translation.y,
        })) ?? [],
    }))
  }

  /**
   * Updates the label position with translation
   */
  public updateLabelWithTranslation(x: number, y: number, translation: Point): void {
    this.label.x = x + translation.x
    this.label.y = y + translation.y
  }
}

function flatten<T>(array: T[][]): T[] {
  return ([] as T[]).concat(...array)
}

const createEdge = (
  node: StateNode,
  transition: StateTransition,
  transitionIndex: number,
  targetIndex: number,
  target: StateNode,
): DirectedGraphEdge => {
  return new DirectedGraphEdge({
    id: `${node.id}:${transitionIndex}:${targetIndex}`,
    source: node,
    target,
    label: { text: transition.eventType, x: 0, y: 0 },
    transition,
    sections: [],
  })
}

const createEdgesForNode = (node: StateNode): DirectedGraphEdge[] => {
  return flatten(
    node.transitions.map((transition, transitionIndex) => {
      const targets = transition.target ? [transition.target] : [node]
      return targets.map((target, targetIndex) => createEdge(node, transition, transitionIndex, targetIndex, target))
    }),
  )
}

export const createDirectedGraph = (node: StateNode): DirectedGraphNode => {
  return new DirectedGraphNode({
    id: node.id,
    stateNode: node,
    children: getChildren(node).map(createDirectedGraph),
    ports: [],
    edges: createEdgesForNode(node),
  })
}

export function getChildren(stateNode: StateNode): StateNode[] {
  if (!stateNode.states) return []

  return Object.entries(stateNode.states)
    .map(([, node]) => node)
    .sort((a, b) => b.order - a.order)
}
