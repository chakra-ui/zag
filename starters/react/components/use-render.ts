import { useRef } from "react"

export interface RenderStrategyProps {
  lazyMount?: boolean
  unmountOnExit?: boolean
}

export interface UseMountStateProps extends RenderStrategyProps {
  visible?: boolean
}

export function useRenderStrategy(props: UseMountStateProps) {
  const { visible, lazyMount, unmountOnExit } = props

  const wasVisible = useRef(false)

  if (visible) {
    wasVisible.current = true
  }

  const unmount = (!visible && !wasVisible.current && lazyMount) || (unmountOnExit && !visible && wasVisible.current)

  return { unmount, visible }
}
