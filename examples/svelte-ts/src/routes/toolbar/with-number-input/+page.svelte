<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as numberInput from "@zag-js/number-input"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id, orientation: "vertical" })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const numberService = useMachine(numberInput.machine, () => ({
    id: `${id}-zoom`,
    ids: { input: api.getItemId("zoom") },
    disabled: api.disabled,
    defaultValue: "100",
    min: 25,
    max: 400,
    step: 25,
  }))
  const numberApi = $derived(numberInput.connect(numberService, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <div {...api.getSeparatorProps()}></div>
    <div {...numberApi.getControlProps()}>
      <button {...numberApi.getDecrementTriggerProps()} aria-label="Zoom out">-</button>
      <input class="toolbar-number-input" {...mergeProps(numberApi.getInputProps(), api.getInputProps({ value: "zoom" }))} />
      <button {...numberApi.getIncrementTriggerProps()} aria-label="Zoom in">+</button>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

