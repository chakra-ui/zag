<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as colorPicker from "@zag-js/color-picker"
  import { colorPickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import serialize from "form-serialize"

  const presets = ["#f47373", "#697689"]

  const controls = useControls(colorPickerControls)

  const [snapshot, send] = useMachine(
    colorPicker.machine({
      id: "1",
      name: "color",
      format: "hsla",
      value: colorPicker.parse("hsl(0, 100%, 50%)"),
    }),
    {
      context: controls.context,
    },
  )

  const api = $derived(colorPicker.connect(snapshot, send, normalizeProps))
</script>

<main class="color-picker">
  <form
    oninput={(e) => {
      console.log("change:", serialize(e.currentTarget, { hash: true }))
    }}
  >
    <input {...api.hiddenInputProps} />
    <div {...api.rootProps}>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label {...api.labelProps}>
        Select Color: <span data-testid="value-text">{api.valueAsString}</span>
      </label>

      <div {...api.controlProps}>
        <button {...api.triggerProps}>
          <div {...api.getTransparencyGridProps({ size: "10px" })} />
          <div {...api.getSwatchProps({ value: api.value })} />
        </button>
        <input {...api.getChannelInputProps({ channel: "hex" })} />
        <input {...api.getChannelInputProps({ channel: "alpha" })} />
      </div>

      <div {...api.positionerProps}>
        <div {...api.contentProps}>
          <div class="content__inner">
            <div {...api.getAreaProps()}>
              <div {...api.getAreaBackgroundProps()} />
              <div {...api.getAreaThumbProps()} />
            </div>

            <div {...api.getChannelSliderProps({ channel: "hue" })}>
              <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
              <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
            </div>

            <div {...api.getChannelSliderProps({ channel: "alpha" })}>
              <div {...api.getTransparencyGridProps({ size: "12px" })} />
              <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} />
              <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
            </div>

            {#if api.format.startsWith("hsl")}
              <div style="display:flex;width:100%;">
                <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
                <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} />
                <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
              </div>
            {/if}

            {#if api.format.startsWith("rgb")}
              <div style="display:flex;width:100%;">
                <span>R</span> <input {...api.getChannelInputProps({ channel: "red" })} />
                <span>G</span> <input {...api.getChannelInputProps({ channel: "green" })} />
                <span>B</span> <input {...api.getChannelInputProps({ channel: "blue" })} />
                <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
              </div>
            {/if}

            {#if api.format.startsWith("hsb")}
              <div style="display:flex;width:100%;">
                <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
                <span>B</span> <input {...api.getChannelInputProps({ channel: "brightness" })} />
                <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
              </div>
            {/if}

            <div style="display:flex;gap:10px;alig-items:center;">
              <div style="position:relative;">
                <div {...api.getTransparencyGridProps({ size: "4px" })} />
                <div {...api.getSwatchProps({ value: api.value })} />
              </div>
              <p data-testid="value-text">{api.valueAsString}</p>
            </div>

            <input {...api.getChannelInputProps({ channel: "hex" })} />

            <div {...api.swatchGroupProps} style="display:flex;gap:10px;">
              {#each presets as preset}
                <button {...api.getSwatchTriggerProps({ value: preset })}>
                  <div style="position:relative;">
                    <div {...api.getTransparencyGridProps({ size: "4px" })} />
                    <div {...api.getSwatchProps({ value: preset })} />
                  </div>
                </button>
              {/each}
            </div>

            <button {...api.eyeDropperTriggerProps}>
              {@render EyeDropIcon()}
            </button>
          </div>
        </div>
      </div>
    </div>
    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
  </form>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>

{#snippet EyeDropIcon()}
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"
    ></path>
  </svg>
{/snippet}
