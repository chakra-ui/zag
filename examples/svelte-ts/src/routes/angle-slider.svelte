<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as angleSlider from "@zag-js/angle-slider"
  import { angleSliderControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(angleSliderControls)

  const service = useMachine(angleSlider.machine, { id: "1" })

  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
    </label>
    <div {...api.getControlProps()}>
      <div {...api.getThumbProps()}></div>
      <div {...api.getMarkerGroupProps()}>
        {#each [0, 45, 90, 135, 180, 225, 270, 315] as value}
          <div {...api.getMarkerProps({ value })}></div>
        {/each}
      </div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
