import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/field.css"

export default function Page() {
  const usernameService = useMachine(field.machine, { id: createUniqueId(), required: true, validationMode: "onBlur" })
  const username = createMemo(() => field.connect(usernameService, normalizeProps))

  const ageService = useMachine(field.machine, { id: createUniqueId(), validationMode: "onBlur" })
  const age = createMemo(() => field.connect(ageService, normalizeProps))

  const websiteService = useMachine(field.machine, { id: createUniqueId(), validationMode: "onBlur" })
  const website = createMemo(() => field.connect(websiteService, normalizeProps))

  return (
    <main class="field-page">
      <form onSubmit={(e) => e.preventDefault()}>
        <div {...username().getRootProps()}>
          <label {...username().getLabelProps()}>Username</label>
          <input {...username().getInputProps()} name="username" pattern="[a-z0-9_]+" minLength={3} maxLength={16} />
          <span {...username().getHelperTextProps()}>3–16 lowercase letters, numbers, or underscores.</span>
          <span {...username().getErrorTextProps({ match: "valueMissing" })}>Choose a username.</span>
          <span {...username().getErrorTextProps({ match: "tooShort" })}>Use at least 3 characters.</span>
          <span {...username().getErrorTextProps({ match: "patternMismatch" })}>
            Use lowercase letters, numbers, or underscores.
          </span>
        </div>

        <div {...age().getRootProps()}>
          <label {...age().getLabelProps()}>Age</label>
          <input {...age().getInputProps()} name="age" type="number" min={13} max={120} step={1} />
          <span {...age().getErrorTextProps({ match: "rangeUnderflow" })}>You must be at least 13.</span>
          <span {...age().getErrorTextProps({ match: "rangeOverflow" })}>Enter an age of 120 or less.</span>
          <span {...age().getErrorTextProps({ match: "stepMismatch" })}>Enter a whole number.</span>
        </div>

        <div {...website().getRootProps()}>
          <label {...website().getLabelProps()}>Website</label>
          <input {...website().getInputProps()} name="website" type="url" placeholder="https://example.com" />
          <span {...website().getErrorTextProps({ match: "typeMismatch" })}>
            Enter a full URL, like https://example.com
          </span>
        </div>

        <div class="actions">
          <button type="submit">Save</button>
          <button type="reset">Reset</button>
        </div>
      </form>
    </main>
  )
}
