<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import { portal } from "@zag-js/svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as timePicker from "@zag-js/time-picker"
  import { timePickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(timePickerControls)

  const [state, send] = useMachine(timePicker.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(timePicker.connect(state, send, normalizeProps))
</script>

<main class="time-picker">
  <div {...api.rootProps}>
    <div {...api.controlProps} style:display="flex" style:gap="10px">
      <input {...api.inputProps} />
      <button {...api.triggerProps}>🗓</button>
      <button {...api.clearTriggerProps}>❌</button>
    </div>

    <span use:portal {...api.positionerProps}>
      <div {...api.contentProps}>
        <div {...api.getColumnProps({ unit: "hour" })}>
          {#each api.getHours() as item (item.value)}
            <button {...api.getHourCellProps({ value: item.value })}>{item.label}</button>
          {/each}
        </div>
        <div {...api.getColumnProps({ unit: "minute" })}>
          {#each api.getMinutes() as item (item.value)}
            <button {...api.getMinuteCellProps({ value: item.value })}>{item.value}</button>
          {/each}
        </div>
        <div {...api.getColumnProps({ unit: "second" })}>
          {#each api.getSeconds() as item (item.value)}
            <button {...api.getSecondCellProps({ value: item.value })}>{item.label}</button>
          {/each}
        </div>
        <div {...api.getColumnProps({ unit: "period" })}>
          <button {...api.getPeriodCellProps({ value: "am" })}>AM</button>
          <button {...api.getPeriodCellProps({ value: "pm" })}>PM</button>
        </div>
      </div>
    </span>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>
