import { createPortal, toChildArray, type ComponentChildren, type JSX, type RefObject } from "preact"
import { useLayoutEffect, useState } from "preact/hooks"

export interface PortalProps {
  disabled?: boolean | undefined
  container?: RefObject<HTMLElement | null> | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
}

export const Portal = (props: PortalProps & { children?: ComponentChildren }): JSX.Element => {
  const { children, container, disabled, getRootNode } = props

  // Not server-rendered: hydration would keep an inline copy beside the portaled one
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  if (disabled) return <>{children}</>
  if (!mounted) return <></>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return <>{toChildArray(children).map((child) => createPortal(<>{child}</>, mountNode))}</>
}
