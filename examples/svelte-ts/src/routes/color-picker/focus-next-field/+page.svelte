<script lang="ts">
  import * as colorPicker from "@zag-js/color-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/color-picker.css"

  const presets = ["#f47373", "#697689", "#37d67a"]

  let nextField: HTMLInputElement | undefined = $state()

  const id = $props.id()
  const service = useMachine(colorPicker.machine, {
    id,
    closeOnSelect: true,
    defaultValue: colorPicker.parse("#ff0000"),
    onValueChange() {
      nextField?.focus()
    },
  })

  const api = $derived(colorPicker.connect(service, normalizeProps))
</script>

<main class="color-picker">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <button {...api.getTriggerProps()}>
        <div {...api.getSwatchProps({ value: api.value })}></div>
      </button>
    </div>
    <input bind:this={nextField} data-testid="next-field" placeholder="Next field" />
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getSwatchGroupProps()} style="display: flex; gap: 8px">
          {#each presets as preset}
            <button {...api.getSwatchTriggerProps({ value: preset })}>
              <div {...api.getSwatchProps({ value: preset })} style="width: 20px; height: 20px"></div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
