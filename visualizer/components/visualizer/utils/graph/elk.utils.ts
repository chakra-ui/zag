import type { ELK, ElkNode, ElkExtendedEdge, ElkEdgeSection } from "elkjs/lib/elk.bundled"
import ELKConstructor from "elkjs/lib/elk.bundled"

import { DirectedGraphEdge, DirectedGraphNode } from "./create-graph"
import type { StateNode } from "./types"
import type {
  StateElkNode,
  StateElkEdge,
  ElkRunContext,
  DOMRectMap,
  DigraphBackLinkMap,
  RelativeNodeEdgeMap,
  ElkNodeJSON,
} from "./elk.types"

declare global {
  export const ELK: typeof import("elkjs/lib/elk.bundled").default
}

// Initialize ELK instance
const elk: ELK =
  typeof window !== "undefined"
    ? new ELKConstructor({ workerUrl: undefined }) // Browser - no web worker
    : new ELKConstructor() // Node.js

export function getAllNodes(rootNode: DirectedGraphNode): Array<DirectedGraphNode> {
  const nodes: DirectedGraphNode[] = []
  const traverse = (node: DirectedGraphNode) => {
    nodes.push(node)
    node.children.forEach(traverse)
  }
  traverse(rootNode)
  return nodes
}

function getBackLinkMap(digraph: DirectedGraphNode): DigraphBackLinkMap {
  const nodes = getAllNodes(digraph)
  const backLinkMap: DigraphBackLinkMap = new Map()

  const addMapping = (node: StateNode, edge: DirectedGraphEdge): void => {
    if (!backLinkMap.get(node)) {
      backLinkMap.set(node, new Set())
    }

    backLinkMap.get(node)!.add(edge)
  }

  nodes.forEach((node) => {
    node.edges.forEach((edge) => {
      addMapping(edge.target, edge)
    })
  })

  return backLinkMap
}

export function isStateElkNode(node: ElkNode): node is StateElkNode {
  return "absolutePosition" in node
}

export function getAllEdges(digraph: DirectedGraphNode): DirectedGraphEdge[] {
  const edges: DirectedGraphEdge[] = []
  const getEdgesRecursive = (dnode: DirectedGraphNode) => {
    edges.push(...dnode.edges)

    dnode.children.forEach(getEdgesRecursive)
  }
  getEdgesRecursive(digraph)

  return edges
}

/**
 * Returns the node that contains the `source` and `target` of the edges, which may be
 * the `source` or `target` itself.
 *
 * See https://www.eclipse.org/elk/documentation/tooldevelopers/graphdatastructure/coordinatesystem.html
 *
 * @param edge
 * @returns containing node
 */
function getContainingNode(edge: DirectedGraphEdge): StateNode | undefined {
  if (edge.isLoop) return edge.source.parent

  const sourceAncestors = new Set<StateNode>()
  let node = edge.source
  while (node) {
    sourceAncestors.add(node)
    node = node.parent!
  }

  node = edge.target
  while (node) {
    if (sourceAncestors.has(node)) return node
    node = node.parent!
  }

  return edge.source.machine
}

function getRelativeNodeEdgeMap(digraph: DirectedGraphNode): RelativeNodeEdgeMap {
  const edges = getAllEdges(digraph)

  const map: RelativeNodeEdgeMap[0] = new Map()
  const edgeMap: RelativeNodeEdgeMap[1] = new Map()

  edges.forEach((edge) => {
    const containingNode = getContainingNode(edge)

    if (!map.has(containingNode)) {
      map.set(containingNode, [])
    }

    map.get(containingNode)!.push(edge)
    edgeMap.set(edge.id, containingNode)
  })

  return [map, edgeMap]
}

function getElkId(id: string): string {
  return id.replaceAll(".", "_").replaceAll(":", "__")
}

export function toJSON(elkNode: ElkNode): ElkNodeJSON {
  const { id, layoutOptions, width, height, children, edges, ports } = elkNode

  return {
    id: getElkId(id),
    layoutOptions,
    width,
    height,
    children: children?.map((node) => toJSON(node as StateElkNode)),
    ports: ports?.map((port) => ({
      id: getElkId(port.id),
      width: port.width,
      height: port.height,
    })),
    edges: edges?.map((_edge) => {
      const edge = _edge as ElkExtendedEdge

      return {
        id: getElkId(edge.id),
        labels: edge.labels?.map((label) => ({
          id: getElkId(label.id || ""),
          width: label.width,
          height: label.height,
          text: label.text,
          layoutOptions: label.layoutOptions,
        })),
        layoutOptions: edge.layoutOptions,
        sources: edge.sources?.map((id) => getElkId(id)),
        targets: edge.targets?.map((id) => getElkId(id)),
      }
    }),
  }
}

function getElkEdge(edge: DirectedGraphEdge, rectMap: DOMRectMap): ElkExtendedEdge & { edge: DirectedGraphEdge } {
  const edgeRect = rectMap.get(edge.id)!
  const targetPortId = getPortId(edge)

  const isInitialEdge = edge.source.parent?.initial === edge.source.key

  const sources = [edge.source.id]
  const targets = edge.isLoop ? [getSelfPortId(edge.target.id)] : [targetPortId]

  return {
    id: edge.id,
    sources,
    targets,

    labels: [
      {
        id: "label:" + edge.id,
        width: edgeRect.width,
        height: edgeRect.height,
        text: edge.label.text,
        layoutOptions: {
          "edgeLabels.inline": !edge.isLoop ? "true" : "false",
          "edgeLabels.placement": "CENTER",
          "edgeLabels.centerLabelPlacementStrategy": "TAIL_LAYER",
        },
      },
    ],
    edge,
    sections: [],
    layoutOptions: {
      // Ensure that all edges originating from initial states point RIGHT
      // (give them direction priority) so that the initial states can end up on the top left
      "elk.layered.priority.direction": isInitialEdge ? "1" : "0",
    },
  }
}

function getPortId(edge: DirectedGraphEdge): string {
  return `port:${edge.id}`
}

function getSelfPortId(nodeId: string): string {
  return `self:${nodeId}`
}

function getElkChild(node: DirectedGraphNode, runContext: ElkRunContext): StateElkNode {
  const { relativeNodeEdgeMap, backLinkMap, rectMap } = runContext
  const nodeRect = rectMap.get(node.id)!
  const contentRect = rectMap.get(`${node.id}:content`)!

  // Edges whose source is this node
  const edges = relativeNodeEdgeMap[0].get(node.data) || []
  // Edges whose target is this node
  const backEdges = Array.from(backLinkMap.get(node.data) ?? [])

  const hasSelfEdges = backEdges.some((edge) => edge.source === edge.target)

  // Nodes should only wrap if they have non-atomic child nodes
  const shouldWrap = getDeepestNodeLevel(node) > node.level + 1

  // Compaction should apply if there was no previous error, since errors can occur
  // sometimes with compaction:
  // https://github.com/kieler/elkjs/issues/98
  const shouldCompact = shouldWrap && !runContext.previousError

  return {
    id: node.id,
    ...(!node.children.length
      ? {
          width: nodeRect.width,
          height: nodeRect.height,
        }
      : undefined),
    node,
    children: getElkChildren(node, runContext),
    absolutePosition: { x: 0, y: 0 },
    edges: edges.map((edge) => {
      return getElkEdge(edge, rectMap)
    }),
    ports: backEdges
      .map((backEdge) => {
        return {
          id: getPortId(backEdge),
          width: 5, // TODO: don't hardcode, find way to reference arrow marker size
          height: 5,
          layoutOptions: {},
        }
      })
      .concat(
        hasSelfEdges
          ? [
              {
                id: getSelfPortId(node.id),
                width: 5,
                height: 5,
                layoutOptions: {},
              },
            ]
          : [],
      ),
    layoutOptions: {
      "elk.padding": `[top=${contentRect.height + 30}, left=30, right=30, bottom=30]`,
      "elk.spacing.labelLabel": "10",
      ...(shouldWrap && {
        "elk.aspectRatio": "2",
        "elk.layered.wrapping.strategy": "MULTI_EDGE",
        ...(shouldCompact && {
          "elk.layered.compaction.postCompaction.strategy": "LEFT",
        }),
      }),
    },
  }
}

function getDeepestNodeLevel(node: DirectedGraphNode): number {
  let maxLevel = node.level

  function traverse(n: DirectedGraphNode) {
    if (n.level > maxLevel) maxLevel = n.level
    n.children.forEach(traverse)
  }

  traverse(node)
  return maxLevel
}

function getElkChildren(node: DirectedGraphNode, runContext: ElkRunContext): StateElkNode[] {
  return node.children.map((childNode) => {
    return getElkChild(childNode, runContext)
  })
}

const getRectMap = (): Promise<DOMRectMap> => {
  return new Promise((resolve, reject) => {
    const rectMap: DOMRectMap = new Map()
    let attempts = 0
    const MAX_ATTEMPTS = 50 // 5 seconds total with 100ms interval

    const collectMeasurements = () => {
      const graphContent = document.querySelector("#graph-content")
      if (!graphContent) {
        attempts++
        if (attempts >= MAX_ATTEMPTS) {
          reject(new Error("Timeout waiting for graph content"))
          return
        }
        return false
      }

      const elements = graphContent.querySelectorAll("[data-rect-id]")
      if (elements.length === 0) {
        attempts++
        if (attempts >= MAX_ATTEMPTS) {
          reject(new Error("Timeout waiting for elements"))
          return
        }
        return false
      }

      // Get measurements for all elements
      elements.forEach((el) => {
        const rectId = (el as HTMLElement).dataset.rectId!
        const rect = el.getBoundingClientRect()
        rectMap.set(rectId, rect)
      })

      return true
    }

    const intervalId = setInterval(() => {
      if (collectMeasurements()) {
        clearInterval(intervalId)
        resolve(rectMap)
      }
    }, 100)
  })
}

export async function getElkGraph(rootDigraphNode: DirectedGraphNode): Promise<ElkNode> {
  const rectMap = await getRectMap()
  const relativeNodeEdgeMap = getRelativeNodeEdgeMap(rootDigraphNode)
  const backLinkMap = getBackLinkMap(rootDigraphNode)
  const rootEdges = relativeNodeEdgeMap[0].get(undefined) || []
  const initialRunContext: ElkRunContext = {
    relativeNodeEdgeMap,
    backLinkMap,
    rectMap,
  }

  // The root node is an invisible node; the machine node is a direct child of this node.
  // It is wrapped so we can have self-loops, which cannot be placed in the root node.
  const getRootElkNodeData = (runContext: ElkRunContext): ElkNode => ({
    id: "root",
    edges: rootEdges.map((edge) => getElkEdge(edge, rectMap)),
    children: [getElkChild(rootDigraphNode, runContext)],
    layoutOptions: {
      "elk.hierarchyHandling": "INCLUDE_CHILDREN",
      "elk.algorithm": "layered",
      "elk.layered.considerModelOrder": "NODES_AND_EDGES",
      "elk.layered.wrapping.strategy": "MULTI_EDGE",
      "elk.aspectRatio": "2",
      "elk.direction": "RIGHT",
    },
  })

  let rootElkNode: ElkNode | undefined = undefined
  let attempts = 0

  // Make multiple attempts to layout ELK node.
  // Depending on the error, certain heuristics may be applied to mitigate the error on the next attempt.
  // These heuristics read the `initialRunContext.previousError` to determine what layout options to change.
  while (attempts <= 2 && !rootElkNode) {
    attempts++
    try {
      rootElkNode = await elk.layout(getRootElkNodeData(initialRunContext))
    } catch (err) {
      console.error(err)
      initialRunContext.previousError = err as Error
    }
  }

  if (!rootElkNode) {
    throw new Error("Unable to layout ELK node.")
  }

  const stateNodeToElkNodeMap = new Map<StateNode, StateElkNode>()

  const setEdgeLayout = (edge: StateElkEdge) => {
    const containingNode = relativeNodeEdgeMap[1].get(edge.id)
    const elkContainingNode = containingNode && stateNodeToElkNodeMap.get(containingNode)!

    const translatedSections: ElkEdgeSection[] =
      elkContainingNode && edge.sections
        ? edge.sections.map((section) => {
            return {
              ...section,
              startPoint: {
                x: section.startPoint.x + elkContainingNode.absolutePosition.x,
                y: section.startPoint.y + elkContainingNode.absolutePosition.y,
              },
              endPoint: {
                x: section.endPoint.x + elkContainingNode.absolutePosition.x,
                y: section.endPoint.y + elkContainingNode.absolutePosition.y,
              },
              bendPoints:
                section.bendPoints?.map((bendPoint) => {
                  return {
                    x: bendPoint.x + elkContainingNode.absolutePosition.x,
                    y: bendPoint.y + elkContainingNode.absolutePosition.y,
                  }
                }) ?? [],
            }
          })
        : (edge.sections ?? [])

    edge.edge.sections = translatedSections
    edge.edge.label.x = (edge.labels?.[0].x || 0) + (elkContainingNode?.absolutePosition.x || 0)
    edge.edge.label.y = (edge.labels?.[0].y || 0) + (elkContainingNode?.absolutePosition.y || 0)
  }

  const setLayout = (elkNode: StateElkNode, parent: StateElkNode | undefined) => {
    stateNodeToElkNodeMap.set(elkNode.node.data, elkNode)
    elkNode.absolutePosition = {
      x: (parent?.absolutePosition.x ?? 0) + elkNode.x!,
      y: (parent?.absolutePosition.y ?? 0) + elkNode.y!,
    }

    elkNode.node.layout = {
      width: elkNode.width!,
      height: elkNode.height!,
      x: elkNode.x!,
      y: elkNode.y!,
    }

    elkNode.edges?.forEach((edge) => {
      setEdgeLayout(edge)
    })

    elkNode.children?.forEach((cn) => {
      if (isStateElkNode(cn)) {
        setLayout(cn, elkNode)
      }
    })
  }

  ;(rootElkNode.edges as StateElkEdge[])?.forEach(setEdgeLayout)

  // Uncomment this for graph debugging:
  // if (process.env.NODE_ENV !== "production") {
  //   console.log(JSON.stringify(toJSON(rootElkNode as StateElkNode), null, 2))
  // }

  // unwrap from the "fake" ancestor node created in the `elkNode` structure
  const machineElkNode = rootElkNode.children![0] as StateElkNode

  setLayout(machineElkNode, undefined)

  return rootElkNode
}
