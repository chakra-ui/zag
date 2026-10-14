<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as colorPicker from "@zag-js/color-picker"
  import { colorPickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"
  import "@styles/color-picker.css"

  const presets = ["#f47373", "oklch(0.7 0.2 200)", "#9f7aea"]

  const controls = useControls(colorPickerControls)

  const id = $props.id()
  const service = useMachine(
    colorPicker.machine,
    controls.mergeProps<colorPicker.Props>({
      id,
      name: "color",
      format: "oklch",
      defaultValue: colorPicker.parse("oklch(0.65 0.15 250)"),
    }),
  )

  const api = $derived(colorPicker.connect(service, normalizeProps))
  const gamutOverlay = $derived(api.getGamutOverlay())
</script>

<main class="color-picker">
  <form
    onchange={(e) => {
      console.log("change:", serialize(e.currentTarget, { hash: true }))
    }}
  >
    <input {...api.getHiddenInputProps()} />
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>
        OKLCH (wide gamut): <span data-testid="value-text">{api.valueAsString}</span>
      </label>

      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <div {...api.getTransparencyGridProps({ size: "10px" })}></div>
          <div {...api.getSwatchProps({ value: api.value })}></div>
        </button>
        <input {...api.getChannelInputProps({ channel: "hex" })} />
        <input {...api.getChannelInputProps({ channel: "alpha" })} />
      </div>

      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div class="content__inner">
            <div {...api.getAreaProps()}>
              <div {...api.getAreaBackgroundProps()}></div>
              {#if gamutOverlay}
                <svg {...api.getGamutOverlayProps()}>
                  <path
                    d={gamutOverlay.path}
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    stroke-width="1.5"
                    vector-effect="non-scaling-stroke"
                  />
                  <text
                    x={gamutOverlay.labelPosition.x}
                    y={gamutOverlay.labelPosition.y}
                    fill="rgba(255,255,255,0.7)"
                    font-size="6"
                    font-family="system-ui, sans-serif"
                    text-anchor="end"
                  >
                    sRGB
                  </text>
                </svg>
              {/if}
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

            {#if api.format === "oklch"}
              <div style="display: flex; width: 100%; flex-wrap: wrap; gap: 6px">
                <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} />
                <span>C</span> <input {...api.getChannelInputProps({ channel: "chroma" })} />
                <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
              </div>
            {/if}

            <p data-testid="value-text">{api.valueAsString}</p>

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
          </div>
        </div>
      </div>
    </div>
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
  </form>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} />
</Toolbar>
