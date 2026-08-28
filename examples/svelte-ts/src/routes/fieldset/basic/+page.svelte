<script lang="ts">
  import * as field from "@zag-js/field"
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/field.css"

  let disabled = $state(false)
  let invalid = $state(false)

  const fieldsetId = $props.id()
  const fieldsetService = useMachine(fieldsetMachine.machine, () => ({
    id: fieldsetId,
    disabled,
    invalid,
  }))
  const fieldsetApi = $derived(fieldsetMachine.connect(fieldsetService, normalizeProps))

  // disabled inheritance is DOM-based: the field picks it up from <fieldset disabled>
  const fieldService = useMachine(field.machine, {
    id: `${fieldsetId}-field`,
    required: true,
  })
  const fieldApi = $derived(field.connect(fieldService, normalizeProps))
</script>

<main class="field-page">
  <h1>Fieldset — Basic</h1>
  <div class="options">
    <label> <input type="checkbox" bind:checked={disabled} /> Disabled </label>
    <label> <input type="checkbox" bind:checked={invalid} /> Invalid </label>
  </div>
  <form onsubmit={(e) => e.preventDefault()}>
    <fieldset {...fieldsetApi.getRootProps()}>
      <legend {...fieldsetApi.getLegendProps()}>Contact details</legend>
      <span {...fieldsetApi.getHelperTextProps()}>How can we reach you?</span>
      <div {...fieldApi.getRootProps()}>
        <label {...fieldApi.getLabelProps()}>
          Phone <span {...fieldApi.getIndicatorProps({ type: "required" })}>*</span>
        </label>
        <input {...fieldApi.getInputProps()} type="tel" placeholder="+1 555 000 0000" />
        <span {...fieldApi.getErrorTextProps()}>{fieldApi.errors[0]}</span>
      </div>
      <span {...fieldsetApi.getErrorTextProps()}>Contact details are incomplete</span>
    </fieldset>
    <div class="actions">
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </div>
  </form>
</main>

<Toolbar viz>
  <StateVisualizer state={fieldsetService} />
  <StateVisualizer state={fieldService} />
</Toolbar>
