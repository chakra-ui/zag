<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const presets = ["#f47373", "#697689"]

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(colorPicker.machine, () => ({
    id,
    name: "color",
    defaultFormat: "hsla" as const,
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
    open,
    onOpenChange: (details) => (open = details.open),
  }))

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>Color Picker Controlled</h1>
  <h1>{String(open)}</h1>

  <div style="display: flex; gap: 12px; margin-bottom: 24px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>
  </div>

  <main class="color-picker">
    <input {...api.getHiddenInputProps()} />
    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>
        Select Color: <span data-testid="value-text">{api.valueAsString}</span>
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
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
