<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const initialValue = colorPicker.parse("hsl(210, 90%, 55%)")

  let liveValue = $state(initialValue.toString("hex"))
  let endValue = $state(initialValue.toString("hex"))

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    inline: true,
    defaultValue: initialValue,
    onValueChange: (details) => (liveValue = details.value.toString("hex")),
    onValueChangeEnd: (details) => (endValue = details.value.toString("hex")),
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <div {...api.getContentProps()}>
      <div class="content__inner">
        <div {...api.getAreaProps()}>
          <div {...api.getAreaBackgroundProps()}></div>
          <div {...api.getAreaThumbProps()}></div>
        </div>

        <div {...api.getChannelSliderProps({ channel: "hue" })}>
          <div {...api.getChannelSliderTrackProps({ channel: "hue" })}></div>
          <div {...api.getChannelSliderThumbProps({ channel: "hue" })}></div>
        </div>
      </div>
    </div>
  </div>

  <div class="color-picker-readouts">
    <span>onValueChange</span>
    <output aria-label="Live value">{liveValue}</output>
    <span>onValueChangeEnd</span>
    <output aria-label="Committed value">{endValue}</output>
  </div>
</main>
