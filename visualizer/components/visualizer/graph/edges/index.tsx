import { DirectedGraphNode } from "../../utils/graph/create-graph"
import { getAllEdges } from "../../utils/graph/elk.utils"
import { InitialEdge } from "./initial-edge"
import { Edge } from "./edge"

export const Edges = (props: { graph: DirectedGraphNode }) => {
  const { graph } = props

  const edges = getAllEdges(graph)
  const nodes = getInitialDigraphNodes(graph)

  return (
    <svg
      style={{
        position: "absolute",
        height: "100vh",
        width: "100vw",
        top: 0,
        left: 0,
        pointerEvents: "none",
        overflow: "visible",
      }}
      id="edges"
    >
      {nodes.map((initialNode) => {
        return <InitialEdge node={initialNode} key={initialNode.id} />
      })}
      {edges.map((edge, i) => {
        return <Edge key={edge.id} edge={edge} order={i} />
      })}
    </svg>
  )
}

function getInitialDigraphNodes(digraph: DirectedGraphNode): DirectedGraphNode[] {
  const nodes: DirectedGraphNode[] = []
  if (digraph.data.parent?.initial === digraph.data.key) {
    nodes.push(digraph)
  }

  digraph.children.forEach((childNode) => {
    nodes.push(...getInitialDigraphNodes(childNode))
  })

  return nodes
}
