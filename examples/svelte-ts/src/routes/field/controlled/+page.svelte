<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  let dirty = $state(false)
  let touched = $state(false)

  const id = $props.id()
  const service = useMachine(field.machine, () => ({
    id,
    required: true,
    dirty,
    touched,
  }))

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Controlled</h1>
  <div class="options">
    <label> <input type="checkbox" bind:checked={dirty} /> Dirty </label>
    <label> <input type="checkbox" bind:checked={touched} /> Touched </label>
  </div>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input {...api.getInputProps()} placeholder="e.g. sage" />
      <span {...api.getHelperTextProps()}>Dirty and touched are owned by the parent. Typing will not flip them.</span>
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
