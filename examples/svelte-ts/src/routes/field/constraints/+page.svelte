<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/field.css"

  const id = $props.id()

  const usernameService = useMachine(field.machine, { id: `${id}-username`, required: true, validationMode: "onBlur" })
  const username = $derived(field.connect(usernameService, normalizeProps))

  const ageService = useMachine(field.machine, { id: `${id}-age`, validationMode: "onBlur" })
  const age = $derived(field.connect(ageService, normalizeProps))

  const websiteService = useMachine(field.machine, { id: `${id}-website`, validationMode: "onBlur" })
  const website = $derived(field.connect(websiteService, normalizeProps))
</script>

<main class="field-page">
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...username.getRootProps()}>
      <label {...username.getLabelProps()}>Username</label>
      <input {...username.getInputProps()} name="username" pattern="[a-z0-9_]+" minlength="3" maxlength="16" />
      <span {...username.getHelperTextProps()}>3–16 lowercase letters, numbers, or underscores.</span>
      <span {...username.getErrorTextProps({ match: "valueMissing" })}>Choose a username.</span>
      <span {...username.getErrorTextProps({ match: "tooShort" })}>Use at least 3 characters.</span>
      <span {...username.getErrorTextProps({ match: "patternMismatch" })}>
        Use lowercase letters, numbers, or underscores.
      </span>
    </div>

    <div {...age.getRootProps()}>
      <label {...age.getLabelProps()}>Age</label>
      <input {...age.getInputProps()} name="age" type="number" min="13" max="120" step="1" />
      <span {...age.getErrorTextProps({ match: "rangeUnderflow" })}>You must be at least 13.</span>
      <span {...age.getErrorTextProps({ match: "rangeOverflow" })}>Enter an age of 120 or less.</span>
      <span {...age.getErrorTextProps({ match: "stepMismatch" })}>Enter a whole number.</span>
    </div>

    <div {...website.getRootProps()}>
      <label {...website.getLabelProps()}>Website</label>
      <input {...website.getInputProps()} name="website" type="url" placeholder="https://example.com" />
      <span {...website.getErrorTextProps({ match: "typeMismatch" })}>Enter a full URL, like https://example.com</span>
    </div>

    <div class="actions">
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
    </div>
  </form>
</main>
