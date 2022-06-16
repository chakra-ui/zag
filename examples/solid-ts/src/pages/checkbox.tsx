import { injectGlobal } from "@emotion/css"
import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, PropTypes, useMachine, useSetup, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { checkboxControls, checkboxStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(checkboxStyle)

export default function Page() {
  const controls = useControls(checkboxControls)

  const [state, send] = useMachine(checkbox.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })
  const api = createMemo(() => checkbox.connect<PropTypes>(state, send, normalizeProps))

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
      <main>
        <form>
          <fieldset>
            <label ref={ref} {...api().rootProps}>
              <span {...api().labelProps}>Input {api().isChecked ? "Checked" : "Unchecked"}</span>
              <input {...inputProps} />
              <div {...api().controlProps} />
            </label>

            <button type="button" disabled={api().isChecked} onClick={() => api().setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api().isChecked} onClick={() => api().setChecked(false)}>
              UnCheck
            </button>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
