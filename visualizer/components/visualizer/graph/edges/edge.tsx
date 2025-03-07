import type { Point } from "@zag-js/rect-utils"
import { DirectedGraphEdge } from "../../utils/graph/create-graph"
import { ArrowMarker } from "./arrow-marker"
import type { LPathParam, SvgPath } from "../../utils/path"
import { pathToD, roundPath } from "../../utils/path"
import { useSimulation } from "../../simulation/context"
import { dataAttr } from "@zag-js/dom-query"
import { isStateNodeActive } from "../../utils/machine/state-node"

function translatePoint(point: Point, vector: Point): Point {
  return {
    x: point.x + vector.x,
    y: point.y + vector.y,
  }
}

export function translate(path: SvgPath, vector: Point): SvgPath {
  return path.map((cmd) => {
    switch (cmd[0]) {
      case "M":
        return ["M", translatePoint(cmd[1], vector)]
      case "L":
        return ["L", translatePoint(cmd[1], vector)]
      default:
        return cmd
    }
  }) as SvgPath
}

export const Edge: React.FC<{ edge: DirectedGraphEdge; order: number }> = ({ edge, order }) => {
  const { service, child } = useSimulation()

  const machine = service.refs.get("machine")
  if (!machine) return null
  const machineState = child.state.get()
  const isActive = isStateNodeActive(edge.source, machine.id, machineState)

  let path: SvgPath | undefined

  if (edge.sections?.length) {
    const section = edge.sections[0]

    path = [["M", section.startPoint], ...(section.bendPoints?.map((point: Point) => ["L", point] as LPathParam) || [])]

    const preLastPoint = path[path.length - 1][1]!
    const xSign = Math.sign(section.endPoint.x - preLastPoint.x)
    const ySign = Math.sign(section.endPoint.y - preLastPoint.y)
    const endPoint = {
      x: section.endPoint.x - 5 * xSign,
      y: section.endPoint.y - 5 * ySign,
    }
    path.push(["L", endPoint])
  }

  const markerId = `${edge.source.order}-${order}`

  return path ? (
    <g data-part="edge-group" data-edge-id={edge.id} data-active={dataAttr(isActive)}>
      <defs>
        <ArrowMarker id={markerId} />
      </defs>
      <path
        stroke="#fff4"
        strokeWidth={2}
        fill="none"
        d={pathToD(roundPath(path))}
        data-part="edge"
        markerEnd={`url(#${markerId})`}
      ></path>
    </g>
  ) : null
}
