<script lang="ts">
  import styles from "../../../../../../shared/src/css/number-input.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as numberInput from "@zag-js/number-input"
  import { numberInputControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(numberInputControls)

  const id = $props.id()
  const service = useMachine(numberInput.machine, controls.mergeProps<numberInput.Props>({ id }))

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<main>
  <div {...api.getRootProps()}>
    <div data-testid="scrubber" {...api.getScrubberProps()} class={styles.Scrubber}></div>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label data-testid="label" {...api.getLabelProps()}> Enter number: </label>
    <div {...api.getControlProps()} class={styles.Control}>
      <button data-testid="dec-button" {...api.getDecrementTriggerProps()} class={styles.DecrementTrigger}> DEC </button>
      <input data-testid="input" {...api.getInputProps()} class={styles.Input} />
      <button data-testid="inc-button" {...api.getIncrementTriggerProps()} class={styles.IncrementTrigger}> INC </button>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} omit={["formatter", "parser"]} />
</Toolbar>
