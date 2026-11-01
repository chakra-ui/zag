<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as checkbox from "@zag-js/checkbox"
  import { checkboxControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"
  import { CheckIcon } from "lucide-svelte"
  import "@styles/checkbox.css"

  const controls = useControls(checkboxControls)

  const id = $props.id()
  const service = useMachine(
    checkbox.machine,
    controls.mergeProps<checkbox.Props>({
      id,
      name: "checkbox",
    }),
  )

  const api = $derived(checkbox.connect(service, normalizeProps))
</script>

<main class="checkbox">
  <form
    class="vstack gap-4"
    onchange={(e) => {
      const result = serialize(e.currentTarget, { hash: true })
      console.log(result)
    }}
  >
    <label {...api.getRootProps()}>
      <div {...api.getControlProps()}>
        <span {...api.getIndicatorProps()}>
          <CheckIcon />
        </span>
      </div>
      <span {...api.getLabelProps()}>Accept terms and conditions</span>
      <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
    </label>

    <div class="hstack">
      <button type="button" disabled={api.checked} onclick={() => api.setChecked(true)}>Check</button>
      <button type="button" disabled={!api.checked} onclick={() => api.setChecked(false)}>Uncheck</button>
      <button type="reset">Reset Form</button>
    </div>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
