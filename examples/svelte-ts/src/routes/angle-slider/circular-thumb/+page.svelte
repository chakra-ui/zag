<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider-custom.css"

  const id = $props.id()
  const service = useMachine(angleSlider.machine, () => ({ id }))
  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider angle-slider-circular">
  <h1>Angle Slider — Circular Thumb</h1>
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
    </label>
    <div {...api.getControlProps()}>
      <div {...api.getThumbProps()}></div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>
