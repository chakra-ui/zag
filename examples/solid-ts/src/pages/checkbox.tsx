import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, createSignal } from "solid-js"
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

  const [fieldsetDisabled, setFieldsetDisabled] = createSignal(false)

  return (
    <>
      <main class="checkbox">
        <form>
          <fieldset>
            <fieldset disabled={fieldsetDisabled()}>
              <label {...api().rootProps}>
                <div {...api().controlProps} />
                <span {...api().labelProps}>Input {api().isChecked ? "Checked" : "Unchecked"}</span>
                <input {...api().hiddenInputProps} data-testid="hidden-input" />
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

            <div>
              <button type="button" onClick={() => setFieldsetDisabled(false)} disabled={!fieldsetDisabled()}>
                Enable fieldset
              </button>
              <button type="button" onClick={() => setFieldsetDisabled(true)} disabled={fieldsetDisabled()}>
                Disable fieldset
              </button>
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
