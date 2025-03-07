import { memo, useMemo } from "react"
import { DirectedGraphNode } from "../utils/graph/create-graph"
import { getAllEdges } from "../utils/graph/elk.utils"
import { StateNode } from "./state-node"
import { Transition } from "./transition"

export const GraphSkeleton = memo((props: { graph: DirectedGraphNode }) => {
  const { graph } = props

  const edges = useMemo(() => getAllEdges(graph), [graph])

  return (
    <div data-part="skeleton" data-graph-id={graph.id}>
      <StateNode node={graph} />
      {edges.map((edge) => {
        return (
          <Transition
            edge={edge}
            key={edge.id}
            position={
              edge.label && {
                x: edge.label.x,
                y: edge.label.y,
              }
            }
          />
        )
      })}
    </div>
  )
})

GraphSkeleton.displayName = "GraphSkeleton"
