import type { JSX } from "@solidjs/web"
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/field.css"

const MAX_LENGTH = 40

export default function Page() {
  const [length, setLength] = createSignal(0)
  const [disabled, setDisabled] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(field.machine, () => ({ id, disabled: disabled(), invalid: length() > MAX_LENGTH }))
  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <main class="field-page">
      <label>
        <input type="checkbox" checked={disabled()} onChange={(e) => setDisabled(e.currentTarget.checked)} /> Disabled
      </label>

      <div {...api().getRootProps()}>
        <span {...(api().getLabelProps() as JSX.HTMLAttributes<HTMLSpanElement>)}>Bio</span>
        <div
          {...api().getControlProps()}
          role="textbox"
          aria-multiline="true"
          contenteditable={api().disabled ? false : "plaintext-only"}
          onInput={(e) => setLength(e.currentTarget.textContent?.length ?? 0)}
        />
        <span {...api().getHelperTextProps()}>
          {length()}/{MAX_LENGTH}
        </span>
        <span {...api().getErrorTextProps()}>Keep it under {MAX_LENGTH} characters.</span>
      </div>
    </main>
  )
}
