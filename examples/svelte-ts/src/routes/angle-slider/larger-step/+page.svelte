<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider.css"

  const STEP = 45
  const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]
  const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

  const id = $props.id()
  const service = useMachine(angleSlider.machine, { id, step: STEP })
  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Wind direction
      <span {...api.getValueTextProps()}>
        {api.value}° {DIRECTIONS[Math.round(api.value / STEP) % DIRECTIONS.length]}
      </span>
    </label>
    <div {...api.getControlProps()}>
      <div class="angle-slider-compass" aria-hidden="true">
        <span>N</span>
        <span>E</span>
        <span>S</span>
        <span>W</span>
      </div>
      <div {...api.getThumbProps()}></div>
      <div {...api.getMarkerGroupProps()}>
        {#each MARKERS as value (value)}
          <div {...api.getMarkerProps({ value })}></div>
        {/each}
      </div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>
