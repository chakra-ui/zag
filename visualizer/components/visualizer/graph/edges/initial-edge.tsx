import type { Point } from "@zag-js/rect-utils"
import { DirectedGraphNode } from "../../utils/graph/create-graph"
import { ArrowMarker } from "./arrow-marker"
import { useSimulation } from "../../simulation/context"
import { dataAttr } from "@zag-js/dom-query"
import { isStateNodeActive } from "../../utils/machine/state-node"

export const InitialEdge: React.FC<{ node: DirectedGraphNode }> = ({ node }) => {
  const { service, child } = useSimulation()

  const machine = service.refs.get("machine")
  if (!machine) return null
  const machineState = child.state.get()
  const stateNode = node.data

  const isActive = isStateNodeActive(stateNode, machine.id, machineState)

  if (!node.absolute) {
    return null
  }

  const endPoint: Point = {
    x: node.absolute.x - 10,
    y: node.absolute.y + 10,
  }

  const startPoint: Point = {
    x: endPoint.x - 5,
    y: endPoint.y - 10,
  }

  const markerId = `n${Math.floor(Math.random() * 1000)}`

  return (
    <g data-part="edge-group" data-active={dataAttr(isActive)}>
      <defs>
        <ArrowMarker id={markerId} />
      </defs>
      <circle data-part="initial-edge-circle" r="4" cx={startPoint.x} cy={startPoint.y} />
      <path
        data-part="edge"
        d={`M ${startPoint.x},${startPoint.y} Q ${startPoint.x},${endPoint.y} ${
          endPoint.x
        },${endPoint.y} L ${endPoint.x + 1}, ${endPoint.y}`}
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#${markerId})`}
        pathLength={1}
      />
    </g>
  )
}
