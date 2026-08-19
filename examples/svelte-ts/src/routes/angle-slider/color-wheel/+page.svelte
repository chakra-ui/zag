<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider-custom.css"

  const id = $props.id()
  const service = useMachine(angleSlider.machine, () => ({ id, defaultValue: 0 }))
  const api = $derived(angleSlider.connect(service, normalizeProps))
  const color = $derived(`hsl(${api.value} 100% 50%)`)
</script>

<main class="angle-slider angle-slider-color-wheel">
  <h1>Angle Slider — Color Wheel (Hue)</h1>
  <div class="swatch" style:background={color}></div>
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Hue: <div {...api.getValueTextProps()}>{api.value}°</div>
    </label>
    <div {...api.getControlProps()}>
      <div {...api.getThumbProps()}></div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>
