import { createElement, useEffect, useLayoutEffect, useReducer, useRef } from "react"
import { createPortal } from "react-dom"

export const useSafeLayoutEffect = typeof document !== "undefined" ? useLayoutEffect : useEffect

export type PortalProps = {
  children: React.ReactNode
  target?: React.RefObject<HTMLElement>
}

export function Portal(props: PortalProps): JSX.Element {
  const { children, target } = props
  const node = useRef<HTMLDivElement | null>(null)
  const portalNode = useRef<HTMLElement | null>(null)
  const [, forceUpdate] = useReducer((s) => s + 1, 0)

  useLayoutEffect(() => {
    if (!node.current) return
    const doc = node.current.ownerDocument
    portalNode.current = doc.createElement("zag-portal")
    doc.body.appendChild(portalNode.current)

    forceUpdate()

    return () => {
      if (portalNode.current) {
        doc.body.removeChild(portalNode.current)
      }
    }
  }, [])

  const targetNode = target?.current ?? portalNode.current

  if (targetNode) {
    return createPortal(children, targetNode) as any
  }

  return createElement("span", { ref: node }) as any
}
