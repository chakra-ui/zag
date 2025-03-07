import { useMachine } from "@zag-js/react"
import { DirectedGraphNode } from "../utils/graph/create-graph"
import { elkMachine } from "../utils/graph/elk.machine"
import { useSimulation } from "../simulation/context"
import { GraphSkeleton } from "./skeleton"
import { useMemo, memo } from "react"
import { getAllEdges } from "../utils/graph/elk.utils"
import { Edges } from "./edges"
import { StateNode } from "./state-node"
import Canvas from "../canvas"
import { Transition } from "./transition"
import { GraphBounds } from "@/components/visualizer/graph/bounds"
import type { FC, JSX } from "react"

const MemoizedEdges = memo(Edges)
const MemoizedStateNode = memo(StateNode)
const MemoizedTransition = memo(Transition)

export const Graph: FC<{ graph: DirectedGraphNode }> = ({ graph }): JSX.Element => {
  const { service } = useSimulation()
  const elkService = useMachine(elkMachine, {
    graph,
    onPrepareElkGraph() {
      service?.send({ type: "PREPARE_ELK_GRAPH" })
    },
    onElkGraphReady() {
      service?.send({ type: "ELK_GRAPH_READY" })
    },
  })

  const elkGraph = elkService.context.get("elkGraph")

  const isElkGraphReady = elkService.state.matches("success") && elkGraph

  const graphEdges = useMemo(() => getAllEdges(graph), [graph])

  //   When the elk graph is ready, we render this
  if (isElkGraphReady) {
    const rootNode = elkGraph.children![0]!.node

    return (
      <Canvas>
        <GraphBounds rootNode={rootNode} edges={graphEdges} />
        <MemoizedEdges graph={graph} />
        <MemoizedStateNode node={rootNode} />
        {graphEdges.map((edge) => {
          return (
            <MemoizedTransition
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
      </Canvas>
    )
  }

  return <GraphSkeleton graph={graph} />
}
