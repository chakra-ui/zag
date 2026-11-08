<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as colorPicker from "@zag-js/color-picker"
  import { colorPickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const sliders = [
    { channel: "hue", label: "Hue" },
    { channel: "alpha", label: "Alpha" },
  ] as const

  const controls = useControls(colorPickerControls)

  const id = $props.id()
  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id,
      name: "color",
      defaultValue: colorPicker.parse("hsla(210, 90%, 55%, 0.8)"),
      inline: true,
    }),
  )

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <div {...api.getContentProps()} class="channel-sliders">
      <div class="channel-sliders__preview">
        <div class="channel-sliders__swatch">
          <div {...api.getTransparencyGridProps({ size: "8px" })}></div>
          <div {...api.getSwatchProps({ value: api.value })}></div>
        </div>
        <div class="channel-sliders__value">
          <span {...api.getValueTextProps()}>{api.valueAsString}</span>
          <input {...api.getChannelInputProps({ channel: "hex" })} />
        </div>
      </div>

      {#each sliders as { channel, label } (channel)}
        <div class="channel-sliders__field">
          <div class="channel-sliders__header">
            <!-- svelte-ignore a11y_label_has_associated_control -->
            <label {...api.getChannelSliderLabelProps({ channel })}>{label}</label>
            <span {...api.getChannelSliderValueTextProps({ channel })}>
              {api.value.toFormat("hsla").formatChannelValue(channel, "en-US")}
            </span>
          </div>
          <div {...api.getChannelSliderProps({ channel })}>
            {#if channel === "alpha"}
              <div {...api.getTransparencyGridProps({ size: "10px" })}></div>
            {/if}
            <div {...api.getChannelSliderTrackProps({ channel })}></div>
            <div {...api.getChannelSliderThumbProps({ channel })}></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
