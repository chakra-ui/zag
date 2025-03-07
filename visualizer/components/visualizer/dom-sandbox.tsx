import { useRef } from "react"

/** Creates an isolated DOM environment for state machine services
 *
 * Why is this needed?
 * ------------------
 * When visualizing state machines, we want to see the state transitions and structure,
 * but we don't want the actual DOM operations (like scroll locks, focus management,
 * or drag and drop) to affect the visualization UI.
 *
 */
export function useDOMSandbox() {
  const sandboxRef = useRef<HTMLIFrameElement>(null)

  const DomSandbox = () => (
    <iframe
      ref={sandboxRef}
      style={{
        width: 0,
        height: 0,
        position: "absolute",
        visibility: "hidden",
      }}
      title="DOM Operations Sandbox"
    />
  )

  return {
    DomSandbox,
    getRootNode: () => sandboxRef.current?.contentDocument ?? document,
  }
}
