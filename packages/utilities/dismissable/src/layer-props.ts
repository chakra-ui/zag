import type { LayerSnapshot } from "./layer-stack"

export function getDismissableLayerAttrs(layer: LayerSnapshot | null | undefined) {
  return {
    "data-nested": layer?.nested ? layer.type : undefined,
    "data-has-nested": layer?.hasNested ? layer.type : undefined,
  }
}

export interface DismissableLayerStyleOptions {
  /**
   * Set `--z-index: var(--layer-index)` on the element that establishes the actual
   * stacking context (backdrop / positioner). Content parts sit inside that stacking
   * context already, so they don't need this.
   */
  zIndex?: boolean
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
  "--z-index"?: string | undefined
  pointerEvents?: "none" | "auto" | undefined
}

export function getDismissableLayerStyle(
  layer: LayerSnapshot | null | undefined,
  options: DismissableLayerStyleOptions = {},
): DismissableLayerStyle {
  const style: DismissableLayerStyle = {
    "--layer-index": layer ? `${layer.index}` : undefined,
    "--nested-layer-count": layer ? `${layer.nestedCount}` : undefined,
    "--z-index": options.zIndex && layer ? "var(--layer-index)" : undefined,
  }

  if (options.pointerEvents) {
    style.pointerEvents = layer?.active ? (layer.blocked ? "none" : "auto") : undefined
  }

  return style
}
