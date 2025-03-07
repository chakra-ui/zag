import { DirectedGraphEdge, DirectedGraphNode } from "@/components/visualizer/utils/graph/create-graph"
import { useEffect } from "react"
import { useControls as useZoomControls } from "react-zoom-pan-pinch"

export const GraphBounds = (props: { rootNode: DirectedGraphNode; edges: DirectedGraphEdge[] }) => {
  const { rootNode, edges } = props
  const { zoomToElement } = useZoomControls()
  useEffect(() => {
    setTimeout(() => {
      zoomToElement("graph-bounds")
    }, 10)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rootNodeTop = rootNode.layout?.y ?? 0
  const rootNodeLeft = rootNode.layout?.x ?? 0
  const rootNodeHeight = rootNode.layout?.height ?? 0
  const rootNodeWidth = rootNode.layout?.width ?? 0

  const bounds = edges.reduce(
    (acc, edge) => ({
      minX: Math.min(acc.minX, edge.label?.x ?? acc.minX),
      maxX: Math.max(acc.maxX, edge.label?.x ?? acc.maxX),
      minY: Math.min(acc.minY, edge.label?.y ?? acc.minY),
      maxY: Math.max(acc.maxY, edge.label?.y ?? acc.maxY),
    }),
    {
      minX: rootNodeLeft,
      maxX: rootNodeLeft + rootNodeWidth,
      minY: rootNodeTop,
      maxY: rootNodeTop + rootNodeHeight,
    },
  )

  const padding = 120

  return (
    <div
      id="graph-bounds"
      style={{
        position: "absolute",
        width: bounds.maxX - bounds.minX + padding * 2,
        height: bounds.maxY - bounds.minY + padding * 2,
        top: bounds.minY - padding,
        left: bounds.minX - padding,
      }}
    />
  )
}
