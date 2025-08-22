import * as checkbox from "@zag-js/checkbox"
import { checkboxControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import serialize from "form-serialize"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(checkboxControls)

  const service = useMachine(
    checkbox.machine,
    controls.mergeProps({
      id: createUniqueId(),
      name: "checkbox",
    }),
  )

  const api = createMemo(() => checkbox.connect(service, normalizeProps))

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
            <label {...api().getRootProps()}>
              <div {...api().getControlProps()} />
              <span {...api().getLabelProps()}>Input {api().checked ? "Checked" : "Unchecked"}</span>
              <input {...api().getHiddenInputProps()} data-testid="hidden-input" />
              <div {...api().getIndicatorProps()}>Indicator</div>
            </label>

            <div>
              <button type="button" disabled={api().checked} onClick={() => api().setChecked(true)}>
                Check
              </button>
              <button type="button" disabled={!api().checked} onClick={() => api().setChecked(false)}>
                Uncheck
              </button>
              <button type="reset">Reset Form</button>
            </div>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
