import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [dirty, setDirty] = createSignal(false)
  const [touched, setTouched] = createSignal(false)

  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
    dirty: dirty(),
    touched: touched(),
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Controlled</h1>
        <div class="options">
          <label>
            <input type="checkbox" checked={dirty()} onChange={(e) => setDirty(e.currentTarget.checked)} />
            Dirty
          </label>
          <label>
            <input type="checkbox" checked={touched()} onChange={(e) => setTouched(e.currentTarget.checked)} />
            Touched
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Username <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api().getInputProps()} placeholder="e.g. sage" />
            <span {...api().getHelperTextProps()}>
              Dirty and touched are owned by the parent. Typing will not flip them.
            </span>
            <span {...api().getErrorTextProps()}>{api().errors[0] ?? "Field is invalid"}</span>
          </div>
          <div class="actions">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
