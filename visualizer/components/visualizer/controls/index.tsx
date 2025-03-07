import { FitIcon, MinusIcon, PlusIcon, ResetIcon } from "./icons"
import { useControls, useTransformComponent, useTransformContext } from "react-zoom-pan-pinch"
import { useSimulation } from "@/components/visualizer/simulation/context"
import { ColorMode } from "@/components/color-mode"

export const Controls = () => {
  const { child, service } = useSimulation()

  const {
    setup: { minScale, maxScale },
  } = useTransformContext()

  const { zoomIn, zoomOut, zoomToElement } = useControls()
  const transformControls = useTransformComponent(({ state }) => {
    const { scale } = state

    return (
      <>
        <button title="zoom in" aria-label="zoom in" disabled={scale >= maxScale} onClick={() => zoomIn()}>
          <PlusIcon />
        </button>
        <button title="zoom out" aria-label="zoom out" disabled={scale <= minScale} onClick={() => zoomOut()}>
          <MinusIcon />
        </button>
        <button title="zoom to element" aria-label="zoom to element" onClick={() => zoomToElement("graph-bounds")}>
          <FitIcon />
        </button>
      </>
    )
  })

  const reset = () => {
    child?.state.set(child.state.initial)
    const settings = service.refs.get("settings") ?? {}
    Object.entries(settings).forEach(([key, value]) => {
      child?.context.set(key, value)
    })
  }

  return (
    <div className="controls" aria-label="visualizer controls">
      {transformControls}
      <button title="reset" aria-label="reset" onClick={() => reset()}>
        <ResetIcon />
      </button>
      <ColorMode />
    </div>
  )
}
