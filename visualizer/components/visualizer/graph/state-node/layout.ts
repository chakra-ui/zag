import { DirectedGraphNode } from "../../utils/graph/create-graph"

export interface LayoutStyles {
  position: {
    left?: string
    top?: string
  }
  dimensions?: {
    width: string
    height: string
  }
}

export const getLayoutStyles = (layout: DirectedGraphNode["layout"]): LayoutStyles => {
  if (!layout) return { position: {} }

  return {
    position: {
      left: `${layout.x}px`,
      top: `${layout.y}px`,
    },
    dimensions: {
      width: `${layout.width}px`,
      height: `${layout.height}px`,
    },
  }
}
