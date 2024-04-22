<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as numberInput from "@zag-js/number-input"
  import { numberInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(numberInputControls)

  const [snapshot, send] = useMachine(numberInput.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(numberInput.connect(snapshot, send, normalizeProps))
</script>

<main>
  <div {...api.rootProps}>
    <div data-testid="scrubber" {...api.scrubberProps}></div>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label data-testid="label" {...api.labelProps}> Enter number: </label>
    <div {...api.controlProps}>
      <button data-testid="dec-button" {...api.decrementTriggerProps}> DEC </button>
      <input data-testid="input" {...api.inputProps} />
      <button data-testid="inc-button" {...api.incrementTriggerProps}> INC </button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} omit={["formatter", "parser"]} />
</Toolbar>
