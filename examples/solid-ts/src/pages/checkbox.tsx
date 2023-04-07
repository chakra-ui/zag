import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { checkboxControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(checkboxControls)

  const [state, send] = useMachine(checkbox.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => checkbox.connect(state, send, normalizeProps))

  const inputProps = createMemo(() =>
    mergeProps(api().inputProps, {
      onChange() {
        if (api().isIndeterminate && !api().isReadOnly) {
          api().setIndeterminate(false)
          api().setChecked(true)
        }
      },
    }),
  )

  return (
    <>
      <main class="checkbox">
        <form>
          <fieldset>
            <label {...api().rootProps}>
              <span {...api().labelProps}>Input {api().isChecked ? "Checked" : "Unchecked"}</span>
              <input {...inputProps} />
              <div {...api().controlProps} />
            </label>

            <button type="button" disabled={api().isChecked} onClick={() => api().setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api().isChecked} onClick={() => api().setChecked(false)}>
              Uncheck
            </button>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
