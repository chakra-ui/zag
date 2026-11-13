<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const errorId = "color-error"
  let invalid = $state(true)

  const id = $props.id()

  const disabledService = useMachine(colorPicker.machine, {
    id: `${id}-disabled`,
    disabled: true,
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const readOnlyService = useMachine(colorPicker.machine, {
    id: `${id}-readonly`,
    readOnly: true,
    defaultValue: colorPicker.parse("#22c55e"),
  })

  const invalidService = useMachine(colorPicker.machine, () => ({
    id: `${id}-invalid`,
    invalid,
    defaultValue: colorPicker.parse("#eab308"),
  }))

  const pickers = $derived([
    { label: "Disabled", api: colorPicker.connect(disabledService, normalizeProps) },
    { label: "Read-only", api: colorPicker.connect(readOnlyService, normalizeProps) },
    { label: "Invalid", api: colorPicker.connect(invalidService, normalizeProps) },
  ])
</script>

<main class="color-picker">
  <div class="color-picker-row">
    {#each pickers as { label, api } (label)}
      {@const rootState = api.getRootState()}
      <div {...api.getRootProps()}>
        <!-- svelte-ignore a11y_label_has_associated_control -->
        <label {...api.getLabelProps()}>{label}</label>

        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <div {...api.getTransparencyGridProps({ size: "10px" })}></div>
            <div {...api.getSwatchProps({ value: api.value })}></div>
          </button>
          <input
            {...api.getChannelInputProps({ channel: "hex" })}
            aria-describedby={rootState.invalid ? errorId : undefined}
          />
        </div>

        {#if rootState.invalid}
          <p id={errorId} class="color-picker-error">Pick a color with enough contrast</p>
        {/if}

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
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <label><input type="checkbox" bind:checked={invalid} /> Mark as invalid</label>
</main>
