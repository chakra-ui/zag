import { useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { nestedStatesMachine } from "../../machines/nested-states.machine"

/**
 * Nested States Demo
 *
 * Custom machine demonstrating Zag's nested state paths:
 * - idle (root)
 * - open (root)
 *   - open.viewing (nested)
 *   - open.editing (nested)
 */
export default function Page() {
  const service = useMachine(nestedStatesMachine, {
    id: useId(),
  })

  const { state, send } = service

  return (
    <>
      <main>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>Nested States Demo</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            Current state: <strong data-testid="current-state">{state.get()}</strong>
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
            A custom machine with <code>open</code> containing nested <code>viewing</code> and <code>editing</code>{" "}
            states.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {state.matches("idle") && <button onClick={() => send({ type: "OPEN" })}>Open</button>}

            {state.matches("open.viewing") && (
              <>
                <button onClick={() => send({ type: "EDIT" })}>Edit</button>
                <button onClick={() => send({ type: "CLOSE" })}>Close</button>
              </>
            )}

            {state.matches("open.editing") && (
              <>
                <button onClick={() => send({ type: "SAVE" })}>Save</button>
                <button onClick={() => send({ type: "CANCEL" })}>Cancel</button>
                <button onClick={() => send({ type: "CLOSE" })}>Close</button>
              </>
            )}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} label="State (nested paths)" />
      </Toolbar>
    </>
  )
}
