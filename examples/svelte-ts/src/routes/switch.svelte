<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { switchControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as zagSwitch from "@zag-js/switch"

  const controls = useControls(switchControls)

  const [snapshot, send] = useMachine(zagSwitch.machine({ id: "1", name: "switch" }), {
    context: controls.context,
  })

  const api = $derived(zagSwitch.connect(snapshot, send, normalizeProps))
</script>

<main class="switch">
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.rootProps}>
    <input {...api.hiddenInputProps} data-testid="hidden-input" />
    <span {...api.controlProps}>
      <span {...api.thumbProps}></span>
    </span>
    <span {...api.labelProps}>Feature is {api.checked ? "enabled" : "disabled"}</span>
  </label>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>
