<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  let open = $state(false)
  let toggleEl = $state<HTMLButtonElement>()

  const id = $props.id()
  const service = useMachine(colorPicker.machine, () => ({
    id,
    defaultValue: colorPicker.parse("#a855f7"),
    open,
    onOpenChange: (details) => (open = details.open),
    onInteractOutside(event) {
      if (toggleEl?.contains(event.detail.target as Node)) event.preventDefault()
    },
  }))

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <p style="display: flex; gap: 12px; align-items: center">
    <button bind:this={toggleEl} type="button" onclick={() => (open = !open)}>
      {open ? "Close picker" : "Open picker"}
    </button>
    <span>
      Open: <output aria-label="Open state">{String(open)}</output>
    </span>
  </p>

  <div {...api.getRootProps()}>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label {...api.getLabelProps()}>Accent color</label>

    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <div {...api.getTransparencyGridProps({ size: "10px" })}></div>
        <div {...api.getSwatchProps({ value: api.value })}></div>
      </button>
      <input {...api.getChannelInputProps({ channel: "hex" })} />
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
        </div>
      </div>
    </div>
  </div>
</main>
