<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider.css"

  const STEP = 45
  const id = $props.id()
  const service = useMachine(angleSlider.machine, () => ({ id, step: STEP }))
  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider">
  <h1>Angle Slider — Larger Step (snaps to {STEP}°)</h1>
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
