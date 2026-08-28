import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [disabled, setDisabled] = createSignal(false)
  const [invalid, setInvalid] = createSignal(false)

  const fieldsetService = useMachine(fieldset.machine, () => ({
    id: createUniqueId(),
    disabled: disabled(),
    invalid: invalid(),
  }))
  const fieldsetApi = createMemo(() => fieldset.connect(fieldsetService, normalizeProps))

  // disabled inheritance is DOM-based: the field picks it up from <fieldset disabled>
  const fieldService = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
  }))
  const fieldApi = createMemo(() => field.connect(fieldService, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Fieldset — Basic</h1>
        <div class="options">
          <label>
            <input type="checkbox" checked={disabled()} onChange={(e) => setDisabled(e.currentTarget.checked)} />
            Disabled
          </label>
          <label>
            <input type="checkbox" checked={invalid()} onChange={(e) => setInvalid(e.currentTarget.checked)} />
            Invalid
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset {...fieldsetApi().getRootProps()}>
            <legend {...fieldsetApi().getLegendProps()}>Contact details</legend>
            <span {...fieldsetApi().getHelperTextProps()}>How can we reach you?</span>
            <div {...fieldApi().getRootProps()}>
              <label {...fieldApi().getLabelProps()}>
                Phone <span {...fieldApi().getIndicatorProps({ type: "required" })}>*</span>
              </label>
              <input {...fieldApi().getInputProps()} type="tel" placeholder="+1 555 000 0000" />
              <span {...fieldApi().getErrorTextProps()}>{fieldApi().errors[0]}</span>
            </div>
            <span {...fieldsetApi().getErrorTextProps()}>Contact details are incomplete</span>
          </fieldset>
          <div class="actions">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={fieldsetService} />
        <StateVisualizer state={fieldService} />
      </Toolbar>
    </>
  )
}
