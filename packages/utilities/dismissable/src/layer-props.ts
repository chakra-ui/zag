import type { LayerSnapshot } from "./layer-stack"

export function getDismissableLayerAttrs(layer: LayerSnapshot | null | undefined) {
  return {
    "data-nested": layer?.active && layer.nested ? layer.type : undefined,
    "data-has-nested": layer?.active && layer.hasNested ? layer.type : undefined,
  }
}

export interface DismissableLayerStyleOptions {
  /**
   * Set `pointer-events: none` while a pointer-blocking layer sits above this one.
   * Omit for elements (like popper positioners) that already manage their own
   * `pointer-events`.
   */
  pointerEvents?: boolean
}

export interface DismissableLayerStyle {
  [key: string]: string | undefined
  "--layer-index"?: string | undefined
  "--nested-layer-count"?: string | undefined
  pointerEvents?: "none" | "auto" | undefined
}

export function getDismissableLayerStyle(
  layer: LayerSnapshot | null | undefined,
  options: DismissableLayerStyleOptions = {},
): DismissableLayerStyle {
  const active = layer?.active === true
  const style: DismissableLayerStyle = {
    // Kept after the layer closes so exit animations hold their place in the stack
    "--layer-index": layer ? `${layer.index}` : undefined,
    "--nested-layer-count": active ? `${layer.nestedCount}` : undefined,
  }

  if (options.pointerEvents) {
    style.pointerEvents = active ? (layer.blocked ? "none" : "auto") : undefined
  }

  return style
}
