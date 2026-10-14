<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    open: false,
    defaultOpen: true,
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main class="date-picker">
  <div {...api.getControlProps()}>
    <input {...api.getInputProps()} />
    <button {...api.getTriggerProps()}>🗓</button>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <table {...api.getTableProps({ view: "day" })}>
        <tbody {...api.getTableBodyProps({ view: "day" })}>
          {#each api.weeks as week, i (i)}
            <tr {...api.getTableRowProps({ view: "day" })}>
              {#each week as value, j (j)}
                <td {...api.getDayTableCellProps({ value })}>
                  <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
<Toolbar viz>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
