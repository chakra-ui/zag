/* eslint-disable react/no-children-prop */

import { memo, useMemo } from "react"

import { createDirectedGraph } from "@/components/visualizer/utils/graph/create-graph"
import { useSimulation } from "@/components/visualizer/simulation/context"

import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { Graph } from "@/components/visualizer/graph"
import { Background } from "@/components/visualizer/background"
import { Controls } from "@/components/visualizer/controls"
import { Nav } from "@/components/visualizer/graph/nav"

export const GraphWrapper = memo(function GraphWrapper(): JSX.Element {
  const { service } = useSimulation()

  const machine = service.refs.get("machine")

  const graph = useMemo(
    () => (machine ? createDirectedGraph(machine) : undefined),

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [machine?.id],
  )

  return (
    <div className="graph-wrapper">
      <TransformWrapper
        limitToBounds={false}
        minScale={0.05}
        doubleClick={{
          disabled: true,
        }}
      >
        <div id="graph-content" className="graph-content">
          {graph ? (
            <Graph graph={graph} />
          ) : (
            // Just because the wrapper always needs a content in the dom
            <TransformComponent children=" " />
          )}
        </div>

        <Background />
        <Controls />
        <Nav />
      </TransformWrapper>
    </div>
  )
})

GraphWrapper.displayName = "GraphWrapper"
