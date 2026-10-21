import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useRouter } from "next/router"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

type Case = "a" | "b"

function EscapeRevertDemo({ case: scenario }: { case: Case }) {
  const id = useId()
  const service = useMachine(editable.machine, {
    id,
    ...(scenario === "b"
      ? { defaultValue: "Segment", defaultEdit: true }
      : { defaultValue: "", activationMode: "click" }),
  })

  const api = editable.connect(service, normalizeProps)

  return (
    <>
      <main className="editable editable-escape-revert" data-ready="true" data-case={scenario}>
        <div {...api.getRootProps()}>
          <div {...api.getAreaProps()}>
            <input data-testid="input" {...api.getInputProps()} />
            <span data-testid="preview" {...api.getPreviewProps()} />
          </div>
          <div {...api.getControlProps()}>
            {!api.editing && (
              <button data-testid="edit-button" {...api.getEditTriggerProps()}>
                Edit
              </button>
            )}
            {api.editing && (
              <>
                <button data-testid="save-button" {...api.getSubmitTriggerProps()}>
                  Save
                </button>
                <button data-testid="cancel-button" {...api.getCancelTriggerProps()}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

export default function Page() {
  const { query, isReady } = useRouter()
  const scenario: Case = query.case === "b" ? "b" : "a"

  if (!isReady) {
    return (
      <>
        <main className="editable editable-escape-revert" data-ready="false" />
        <Toolbar>
          <div />
        </Toolbar>
      </>
    )
  }

  return <EscapeRevertDemo key={scenario} case={scenario} />
}
