<script lang="ts">
  import * as angleSlider from "@zag-js/angle-slider"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/angle-slider.css"

  const id = $props.id()
  const service = useMachine(angleSlider.machine, { id, defaultValue: 120 })
  const api = $derived(angleSlider.connect(service, normalizeProps))
</script>

<main class="angle-slider angle-slider-knob">
  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      Shadow angle
      <span {...api.getValueTextProps()}>{api.value}°</span>
    </label>
    <div {...api.getControlProps()}>
      <div {...api.getThumbProps()}></div>
    </div>
    <input {...api.getHiddenInputProps()} />
  </div>
</main>
