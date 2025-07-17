import type { PropsWithChildren, RefObject } from "hono/jsx"
import { Fragment, Children } from "hono/jsx"
import { createPortal } from "hono/jsx/dom"

export interface PortalProps {
  disabled?: boolean | undefined
  container?: RefObject<HTMLElement> | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
}

export const Portal = (props: PropsWithChildren<PortalProps>) => {
  const { children, container, disabled, getRootNode } = props

  const isServer = typeof window === "undefined"
  if (isServer || disabled) return <Fragment>{children}</Fragment>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return <Fragment>{Children.map(Children.toArray(children), (child) => createPortal(child, mountNode))}</Fragment>
}
