import { createPortal, toChildArray, type ComponentChildren, type JSX, type RefObject } from "preact"
import { useLayoutEffect, useReducer } from "preact/hooks"

export interface PortalProps {
  disabled?: boolean | undefined
  container?: RefObject<HTMLElement | null> | undefined
  getRootNode?: (() => ShadowRoot | Document | Node) | undefined
}

export const Portal = (props: PortalProps & { children?: ComponentChildren }): JSX.Element => {
  const { children, container, disabled, getRootNode } = props

  const [, forceUpdate] = useReducer((c) => c + 1, 0)

  useLayoutEffect(() => {
    forceUpdate({})
  }, [])

  const isServer = typeof window === "undefined"
  if (isServer || disabled) return <>{children}</>

  const doc = getRootNode?.().ownerDocument ?? document
  const mountNode = container?.current ?? doc.body

  return <>{toChildArray(children).map((child) => createPortal(<>{child}</>, mountNode))}</>
}
