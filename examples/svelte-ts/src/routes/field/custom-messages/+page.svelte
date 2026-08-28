<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  const id = $props.id()
  const service = useMachine(field.machine, {
    id,
    required: true,
    validationMode: "onBlur",
  })

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Custom messages</h1>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Website <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...api.getInputProps()} type="url" placeholder="https://example.com" />
      <span {...api.getHelperTextProps()}>Shown on your public profile.</span>
      <span {...api.getErrorTextProps({ match: "valueMissing" })}>Please enter your website URL.</span>
      <span {...api.getErrorTextProps({ match: "typeMismatch" })}>Enter a full URL, like https://example.com</span>
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
