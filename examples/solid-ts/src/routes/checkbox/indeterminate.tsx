import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

export default function Page() {
  const service = useMachine(checkbox.machine, {
    id: createUniqueId(),
    name: "uncontrolled",
    defaultChecked: "indeterminate",
  })

  const api = createMemo(() => checkbox.connect(service, normalizeProps))

  const [checked, setChecked] = createSignal<checkbox.CheckedState>("indeterminate")
  const controlledId = createUniqueId()

  const controlledService = useMachine(checkbox.machine, () => ({
    id: controlledId,
    name: "controlled",
    checked: checked(),
    onCheckedChange(details) {
      setChecked(details.checked)
    },
  }))

  const controlledApi = createMemo(() => checkbox.connect(controlledService, normalizeProps))

  return (
    <>
      <main class="checkbox">
        <form>
          <fieldset>
            <label {...api().getRootProps()}>
              <div {...api().getControlProps()} />
              <span {...api().getLabelProps()}>Uncontrolled: {String(api().checkedState)}</span>
              <input {...api().getHiddenInputProps()} data-testid="hidden-input" />
            </label>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>

        <label {...controlledApi().getRootProps()}>
          <div {...controlledApi().getControlProps()} />
          <span {...controlledApi().getLabelProps()}>Controlled: {String(controlledApi().checkedState)}</span>
          <input {...controlledApi().getHiddenInputProps()} data-testid="controlled-hidden-input" />
        </label>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
