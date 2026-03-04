<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as checkbox from "@zag-js/checkbox"
  import { checkboxControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const controls = useControls(checkboxControls)

  const id = $props.id()
  const service = useMachine(
    checkbox.machine,
    controls.mergeProps<checkbox.Props>({
      id,
    }),
  )

  const api = $derived(checkbox.connect(service, normalizeProps))
</script>

<main class="checkbox">
  <form
    oninput={(e) => {
      const result = serialize(e.currentTarget, { hash: true })
      console.log(result)
    }}
  >
    <fieldset>
      <label {...api.getRootProps()}>
        <div {...api.getControlProps()}></div>
        <span {...api.getLabelProps()}>Input {api.checked ? "Checked" : "Unchecked"}</span>
        <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
        <div {...api.getIndicatorProps()}>Indicator</div>
      </label>

      <button type="button" disabled={api.checked} onclick={() => api.setChecked(true)}>Check</button>
      <button type="button" disabled={!api.checked} onclick={() => api.setChecked(false)}>Uncheck</button>
      <button type="reset">Reset Form</button>
    </fieldset>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
