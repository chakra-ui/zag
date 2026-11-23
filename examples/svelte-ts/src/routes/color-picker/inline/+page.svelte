<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as colorPicker from "@zag-js/color-picker"
  import { colorPickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import EyeDropIcon from "#lib/components/eye-drop-icon.svelte"
  import "@styles/color-picker.css"

  const presets = ["#f47373", "#697689"]

  const controls = useControls(colorPickerControls)

  const id = $props.id()
  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id,
      name: "color",
      defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
      inline: true,
    }),
  )

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <output>
    <div>Selected: {api.valueAsString}</div>
  </output>

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

        <div {...api.getChannelSliderProps({ channel: "alpha" })}>
          <div {...api.getTransparencyGridProps({ size: "12px" })}></div>
          <div {...api.getChannelSliderTrackProps({ channel: "alpha" })}></div>
          <div {...api.getChannelSliderThumbProps({ channel: "alpha" })}></div>
        </div>

        {#if api.format.startsWith("hsl")}
          <div class="color-picker-channel-inputs">
            <label>H <input {...api.getChannelInputProps({ channel: "hue" })} /></label>
            <label>S <input {...api.getChannelInputProps({ channel: "saturation" })} /></label>
            <label>L <input {...api.getChannelInputProps({ channel: "lightness" })} /></label>
            <label>A <input {...api.getChannelInputProps({ channel: "alpha" })} /></label>
          </div>
        {/if}

        {#if api.format.startsWith("rgb")}
          <div class="color-picker-channel-inputs">
            <label>R <input {...api.getChannelInputProps({ channel: "red" })} /></label>
            <label>G <input {...api.getChannelInputProps({ channel: "green" })} /></label>
            <label>B <input {...api.getChannelInputProps({ channel: "blue" })} /></label>
            <label>A <input {...api.getChannelInputProps({ channel: "alpha" })} /></label>
          </div>
        {/if}

        {#if api.format.startsWith("hsb")}
          <div class="color-picker-channel-inputs">
            <label>H <input {...api.getChannelInputProps({ channel: "hue" })} /></label>
            <label>S <input {...api.getChannelInputProps({ channel: "saturation" })} /></label>
            <label>B <input {...api.getChannelInputProps({ channel: "brightness" })} /></label>
            <label>A <input {...api.getChannelInputProps({ channel: "alpha" })} /></label>
          </div>
        {/if}

        <div style="display: flex; gap: 10px; align-items: center">
          <div style="position: relative">
            <div {...api.getTransparencyGridProps({ size: "4px" })}></div>
            <div {...api.getSwatchProps({ value: api.value })}></div>
          </div>
          <p data-testid="value-text">{api.valueAsString}</p>
        </div>

        <input {...api.getChannelInputProps({ channel: "hex" })} />

        <div {...api.getSwatchGroupProps()} style="display: flex; gap: 10px">
          {#each presets as preset (preset)}
            <button {...api.getSwatchTriggerProps({ value: preset })}>
              <div style="position: relative">
                <div {...api.getTransparencyGridProps({ size: "4px" })}></div>
                <div {...api.getSwatchProps({ value: preset })}></div>
              </div>
            </button>
          {/each}
        </div>

        <button {...api.getEyeDropperTriggerProps()}>
          <EyeDropIcon />
        </button>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
