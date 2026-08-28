<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  const frameworks = ["React", "Solid", "Svelte", "Vue", "Preact"]

  const id = $props.id()
  const service = useMachine(field.machine, { id, required: true })

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <h1>Field — Select</h1>
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Framework <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <select {...api.getSelectProps()}>
        <option value="">Select a framework…</option>
        {#each frameworks as framework (framework)}
          <option value={framework.toLowerCase()}>{framework}</option>
        {/each}
      </select>
      <span {...api.getHelperTextProps()}>The one you reach for first.</span>
      <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
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
