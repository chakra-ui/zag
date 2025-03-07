import type { ElkExtendedEdge, ElkNode } from "elkjs"
import { DirectedGraphEdge, DirectedGraphNode } from "./create-graph"
import type { Point } from "@zag-js/rect-utils"
import type { StateNode } from "./types"

export interface StateElkNode extends ElkNode {
  node: DirectedGraphNode
  absolutePosition: Point
  edges: StateElkEdge[]
  children: StateElkNode[]
}

export interface StateElkEdge extends ElkExtendedEdge {
  edge: DirectedGraphEdge
}

export type RelativeNodeEdgeMap = [Map<StateNode | undefined, DirectedGraphEdge[]>, Map<string, StateNode | undefined>]

export type DOMRectMap = Map<string, DOMRect>

export type DigraphBackLinkMap = Map<StateNode, Set<DirectedGraphEdge>>

export interface ElkRunContext {
  previousError?: Error
  relativeNodeEdgeMap: RelativeNodeEdgeMap
  backLinkMap: DigraphBackLinkMap
  rectMap: DOMRectMap
}

export interface ElkNodeJSON {
  id: string
  layoutOptions?: Record<string, string>
  width?: number
  height?: number
  children?: ElkNodeJSON[]
  ports?: Array<{
    id: string
    width?: number
    height?: number
  }>
  edges?: Array<{
    id: string
    labels?: Array<{
      id: string
      width?: number
      height?: number
      text?: string
      layoutOptions?: Record<string, string>
    }>
    layoutOptions?: Record<string, string>
    sources?: string[]
    targets?: string[]
  }>
}
