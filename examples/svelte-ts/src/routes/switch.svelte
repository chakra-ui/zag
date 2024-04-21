<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { switchControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"

  const controls = useControls(switchControls)

  const [state, send] = useMachine(zagSwitch.machine({ id: "1", name: "switch" }), {
    context: controls.context,
  })

  const api = $derived(zagSwitch.connect(state, send, normalizeProps))
</script>

<main class="switch">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label {...api.rootProps}>
    <input {...api.hiddenInputProps} data-testid="hidden-input" />
    <span {...api.controlProps}>
      <span {...api.thumbProps}></span>
    </span>
    <span {...api.labelProps}>Feature is {api.checked ? "enabled" : "disabled"}</span>
  </label>
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>
