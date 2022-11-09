import * as React from "react"
import { createPortal } from "react-dom"

export const useLayoutEffect = typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect

type PortalProps = {
  children: React.ReactNode
  target?: React.RefObject<HTMLElement>
}

export function Portal({ children, target }: PortalProps): JSX.Element {
  const node = React.useRef<HTMLDivElement | null>(null)
  const portalNode = React.useRef<HTMLElement | null>(null)
  const [, forceUpdate] = React.useState({})

  useLayoutEffect(() => {
    if (!node.current) return
    const doc = node.current.ownerDocument
    portalNode.current = doc.createElement("zag-portal")
    doc.body.appendChild(portalNode.current)

    forceUpdate({})

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

  return React.createElement("span", { ref: node }) as any
}
