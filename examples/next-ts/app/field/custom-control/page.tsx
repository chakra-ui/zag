"use client"

import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/field.css"

const MAX_LENGTH = 40

export default function Page() {
  const [length, setLength] = useState(0)
  const [disabled, setDisabled] = useState(false)

  const service = useMachine(field.machine, { id: useId(), disabled, invalid: length > MAX_LENGTH })
  const api = field.connect(service, normalizeProps)

  return (
    <main className="field-page">
      <label>
        <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.currentTarget.checked)} /> Disabled
      </label>

      <div {...api.getRootProps()}>
        <span {...api.getLabelProps()}>Bio</span>
        <div
          {...api.getControlProps()}
          role="textbox"
          aria-multiline="true"
          contentEditable={api.disabled ? false : "plaintext-only"}
          suppressContentEditableWarning
          onInput={(e) => setLength(e.currentTarget.textContent?.length ?? 0)}
        />
        <span {...api.getHelperTextProps()}>
          {length}/{MAX_LENGTH}
        </span>
        <span {...api.getErrorTextProps()}>Keep it under {MAX_LENGTH} characters.</span>
      </div>
    </main>
  )
}
