import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(checkboxControls)

  const [state, send] = useMachine(
    checkbox.machine({
      name: "checkbox",
      id: createUniqueId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => checkbox.connect(state, send, normalizeProps))

  return (
    <>
      <main class="checkbox">
        <form
          onChange={(e) => {
            const result = serialize(e.currentTarget, { hash: true })
            console.log(result)
          }}
        >
          <fieldset>
            <fieldset>
              <label {...api().rootProps}>
                <div {...api().controlProps} />
                <span {...api().labelProps}>Input {api().isChecked ? "Checked" : "Unchecked"}</span>
                <input {...api().hiddenInputProps} data-testid="hidden-input" />
                <div {...api().indicatorProps}>Indicator</div>
              </label>
            </fieldset>

            <div>
              <button type="button" disabled={api().isChecked} onClick={() => api().setChecked(true)}>
                Check
              </button>
              <button type="button" disabled={!api().isChecked} onClick={() => api().setChecked(false)}>
                Uncheck
              </button>
              <button type="reset">Reset Form</button>
            </div>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
