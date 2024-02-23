import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { cloneElement, isValidElement, useId } from "react"
import { RenderStrategyProps, useRenderStrategy } from "./use-render"

interface Props extends Omit<collapsible.Context, "id" | "open.controlled">, RenderStrategyProps {
  defaultOpen?: boolean
  trigger?: React.ReactNode
  children: React.ReactNode
}

export function Collapsible(props: Props) {
  const [machineProps, restProps] = collapsible.splitProps(props)
  const { trigger, children, defaultOpen, lazyMount, unmountOnExit } = restProps

  const [state, send] = useMachine(
    collapsible.machine({
      id: useId(),
      open: machineProps.open ?? defaultOpen,
      "open.controlled": open !== undefined,
    }),
    {
      context: {
        ...machineProps,
        open: machineProps.open,
      },
    },
  )

  const api = collapsible.connect(state, send, normalizeProps)

  const { unmount } = useRenderStrategy({
    visible: api.isVisible,
    lazyMount,
    unmountOnExit,
  })

  return (
    <div {...api.rootProps}>
      {isValidElement(trigger) ? cloneElement(trigger, api.triggerProps) : null}
      {unmount ? null : <div {...api.contentProps}>{children}</div>}
    </div>
  )
}
