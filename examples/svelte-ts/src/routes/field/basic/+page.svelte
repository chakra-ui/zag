<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  let disabled = $state(false)
  let invalid = $state(false)
  let required = $state(true)

  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    disabled,
    invalid,
    required,
  }))

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Basic</h1>
  <div class="options">
    <label> <input type="checkbox" bind:checked={disabled} /> Disabled </label>
    <label> <input type="checkbox" bind:checked={invalid} /> Invalid </label>
    <label> <input type="checkbox" bind:checked={required} /> Required </label>
  </div>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...api.getInputProps()} placeholder="e.g. sage" />
      <span {...api.getHelperTextProps()}>Choose a short, memorable name.</span>
      <span {...api.getErrorTextProps()}>{api.errors[0] ?? "Field is invalid"}</span>
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
