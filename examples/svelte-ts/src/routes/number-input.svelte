<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as numberInput from "@zag-js/number-input"
  import { numberInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(numberInputControls)

  const service = useMachine(numberInput.machine, { id: "1" })

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <div data-testid="scrubber" {...api.getScrubberProps()}></div>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label data-testid="label" {...api.getLabelProps()}> Enter number: </label>
    <div {...api.getControlProps()}>
      <button data-testid="dec-button" {...api.getDecrementTriggerProps()}> DEC </button>
      <input data-testid="input" {...api.getInputProps()} />
      <button data-testid="inc-button" {...api.getIncrementTriggerProps()}> INC </button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["formatter", "parser"]} />
</Toolbar>
