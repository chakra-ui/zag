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
    selectionMode: "multiple",
    minView: "month",
    maxSelectedDates: 2,
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main class="date-picker">
  <output class="date-output">
    <div>Selected: {api.valueAsString ?? "-"}</div>
  </output>
  <div {...api.getControlProps()}>
    <input {...api.getInputProps()} />
    <button {...api.getTriggerProps()}>🗓</button>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div hidden={api.view !== "month"}>
        <div {...api.getViewControlProps({ view: "month" })}>
          <button {...api.getPreviousTriggerProps({ view: "month" })}>Prev</button>
          <button {...api.getViewTriggerProps({ view: "month" })}>{api.visibleRange.start.year}</button>
          <button {...api.getNextTriggerProps({ view: "month" })}>Next</button>
        </div>
        <table {...api.getTableProps({ view: "month", columns: 4 })}>
          <tbody {...api.getTableBodyProps({ view: "month" })}>
            {#each api.getMonthsGrid({ columns: 4, format: "short" }) as months, row (row)}
              <tr {...api.getTableRowProps()}>
                {#each months as month, index (index)}
                  <td {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                    <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>{month.label}</div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</main>
<Toolbar viz>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
