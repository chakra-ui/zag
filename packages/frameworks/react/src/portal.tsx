import type { JSX, PropsWithChildren, RefObject } from "react"
import { Children, useReducer } from "react"
import { createPortal } from "react-dom"
import { useSafeLayoutEffect } from "./use-layout-effect"

export interface PortalProps {
  disabled?: boolean
  container?: RefObject<HTMLElement>
  getRootNode?: () => ShadowRoot | Document | Node
}

export const Portal = (props: PropsWithChildren<PortalProps>): JSX.Element => {
  const { children, container, disabled, getRootNode } = props

  const [, forceUpdate] = useReducer((c) => c + 1, 0)

  useSafeLayoutEffect(() => {
    forceUpdate()
  }, [])

  const isServer = typeof window === "undefined"
  if (isServer || disabled) return <>{children}</>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return <>{Children.map(children, (child) => createPortal(child, mountNode))}</>
}
