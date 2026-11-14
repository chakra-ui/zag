<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/field.css"

  const MAX_LENGTH = 40

  let length = $state(0)
  let disabled = $state(false)

  const id = $props.id()
  const service = useMachine(field.machine, () => ({ id, disabled, invalid: length > MAX_LENGTH }))
  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <label><input type="checkbox" bind:checked={disabled} /> Disabled</label>

  <div {...api.getRootProps()}>
    <span {...api.getLabelProps() as Record<string, unknown>}>Bio</span>
    <div
      {...api.getControlProps()}
      role="textbox"
      aria-multiline="true"
      contenteditable={api.disabled ? "false" : "plaintext-only"}
      oninput={(e) => (length = e.currentTarget.textContent?.length ?? 0)}
    ></div>
    <span {...api.getHelperTextProps()}>{length}/{MAX_LENGTH}</span>
    <span {...api.getErrorTextProps()}>Keep it under {MAX_LENGTH} characters.</span>
  </div>
</main>
