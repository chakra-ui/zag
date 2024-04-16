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
        <div {...api.getContentColumnProps({ type: "hour" })}>
          {#each api.getAvailableHours() as hour (hour)}
            <button {...api.getHourCellProps({ hour })}>{hour}</button>
          {/each}
        </div>
        <div {...api.getContentColumnProps({ type: "minute" })}>
          {#each api.getAvailableMinutes() as minute (minute)}
            <button {...api.getMinuteCellProps({ minute })}>{minute}</button>
          {/each}
        </div>
        <div {...api.getContentColumnProps({ type: "second" })}>
          {#each api.getAvailableSeconds() as second (second)}
            <button {...api.getSecondCellProps({ second })}>{second}</button>
          {/each}
        </div>
        <div {...api.getContentColumnProps({ type: "period" })}>
          <button {...api.getPeriodCellProps({ period: "am" })}>AM</button>
          <button {...api.getPeriodCellProps({ period: "pm" })}>PM</button>
        </div>
      </div>
    </span>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>
