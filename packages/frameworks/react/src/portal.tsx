import type { JSX, PropsWithChildren, RefObject } from "react"
import * as React from "react"
import { createPortal } from "react-dom"

export interface PortalProps {
  disabled?: boolean
  container?: RefObject<HTMLElement>
  getRootNode?: () => ShadowRoot | Document | Node
}

export const Portal = (props: PropsWithChildren<PortalProps>): JSX.Element => {
  const { children, container, disabled, getRootNode } = props

  const isServer = typeof window === "undefined"
  if (isServer || disabled) return <React.Fragment>{children}</React.Fragment>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return <React.Fragment>{React.Children.map(children, (child) => createPortal(child, mountNode))}</React.Fragment>
}
