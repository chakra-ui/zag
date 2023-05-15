import { createElement, useReducer, useRef } from "react"
import { createPortal } from "react-dom"
import { useSafeLayoutEffect } from "./use-layout-effect"

export type PortalProps = {
  children: React.ReactNode
  target?: React.RefObject<HTMLElement>
}

export function Portal(props: PortalProps): JSX.Element {
  const { children, target } = props
  const node = useRef<HTMLDivElement | null>(null)
  const portalNode = useRef<HTMLElement | null>(null)
  const [, forceUpdate] = useReducer((s) => s + 1, 0)

  useSafeLayoutEffect(() => {
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
    return createPortal(children as any, targetNode)
  }

  return createElement("span", { ref: node })
}
