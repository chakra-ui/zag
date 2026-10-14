<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    defaultValue: colorPicker.parse("#3b82f6"),
    name: "color",
    format: "hsla",
    dir: "rtl",
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <form {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>
      {"اختر اللون"} ({api.valueAsString})
    </label>
    <input {...api.getHiddenInputProps()} />

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <div {...api.getTransparencyGridProps({ size: "4px" })}></div>
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
            <div {...api.getAreaThumbProps()}></div>
          </div>

          <div {...api.getChannelSliderProps({ channel: "hue" })}>
            <div {...api.getChannelSliderTrackProps({ channel: "hue" })}></div>
            <div {...api.getChannelSliderThumbProps({ channel: "hue" })}></div>
          </div>

          <div {...api.getChannelSliderProps({ channel: "alpha" })}>
            <div {...api.getTransparencyGridProps({ size: "8px" })}></div>
            <div {...api.getChannelSliderTrackProps({ channel: "alpha" })}></div>
            <div {...api.getChannelSliderThumbProps({ channel: "alpha" })}></div>
          </div>

          {#if api.format.startsWith("hsl")}
            <div style="display: flex; width: 100%">
              <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
              <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
              <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} />
              <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
            </div>
          {/if}

          {#if api.format.startsWith("rgb")}
            <div style="display: flex; width: 100%">
              <span>R</span> <input {...api.getChannelInputProps({ channel: "red" })} />
              <span>G</span> <input {...api.getChannelInputProps({ channel: "green" })} />
              <span>B</span> <input {...api.getChannelInputProps({ channel: "blue" })} />
              <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
            </div>
          {/if}

          {#if api.format.startsWith("hsb")}
            <div style="display: flex; width: 100%">
              <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
              <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
              <span>B</span> <input {...api.getChannelInputProps({ channel: "brightness" })} />
              <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </form>
</main>
