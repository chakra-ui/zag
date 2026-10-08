<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as checkbox from "@zag-js/checkbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()

  const service = useMachine(checkbox.machine, {
    id,
    name: "uncontrolled",
    defaultChecked: "indeterminate",
  })

  const api = $derived(checkbox.connect(service, normalizeProps))

  let checked = $state<checkbox.CheckedState>("indeterminate")

  const controlledService = useMachine(checkbox.machine, () => ({
    id: `${id}-controlled`,
    name: "controlled",
    checked,
    onCheckedChange(details) {
      checked = details.checked
    },
  }))

  const controlledApi = $derived(checkbox.connect(controlledService, normalizeProps))
</script>

<main class="checkbox">
  <form>
    <fieldset>
      <label {...api.getRootProps()}>
        <div {...api.getControlProps()}></div>
        <span {...api.getLabelProps()}>Uncontrolled: {String(api.checkedState)}</span>
        <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
      </label>
      <button type="reset">Reset Form</button>
    </fieldset>
  </form>

  <label {...controlledApi.getRootProps()}>
    <div {...controlledApi.getControlProps()}></div>
    <span {...controlledApi.getLabelProps()}>Controlled: {String(controlledApi.checkedState)}</span>
    <input {...controlledApi.getHiddenInputProps()} data-testid="controlled-hidden-input" />
  </label>
</main>

<Toolbar viz>
  <StateVisualizer state={service} />
</Toolbar>
