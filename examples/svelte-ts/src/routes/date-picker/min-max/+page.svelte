<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(datePicker.machine, () => ({
    id,
    locale: "en",
    selectionMode: "single",
    min: datePicker.parse("2025-07-01"),
    max: datePicker.parse("2025-09-30"),
  }))

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main class="date-picker">
  <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

  <output class="date-output">
    <div>Selected: {api.valueAsString ?? "-"}</div>
    <div>Focused: {api.focusedValueAsString}</div>
  </output>

  <div {...api.getControlProps()}>
    <input {...api.getInputProps()} />
    <button {...api.getClearTriggerProps()}>❌</button>
    <button {...api.getTriggerProps()}>🗓</button>
  </div>

  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div style="margin-bottom: 20px">
        <select {...api.getMonthSelectProps()}>
          {#each api.getMonths() as month, i (i)}
            <option value={month.value} disabled={month.disabled}>{month.label}</option>
          {/each}
        </select>

        <select {...api.getYearSelectProps()}>
          {#each api.getYears() as year, i (i)}
            <option value={year.value} disabled={year.disabled}>{year.label}</option>
          {/each}
        </select>
      </div>

      <div hidden={api.view !== "day"}>
        <div {...api.getViewControlProps({ view: "year" })}>
          <button {...api.getPrevTriggerProps()}>Prev</button>
          <button {...api.getViewTriggerProps()}>{api.visibleRangeText.start}</button>
          <button {...api.getNextTriggerProps()}>Next</button>
        </div>

        <table {...api.getTableProps({ view: "day" })}>
          <thead {...api.getTableHeaderProps({ view: "day" })}>
            <tr {...api.getTableRowProps({ view: "day" })}>
              {#each api.weekDays as day, i (i)}
                <th scope="col" aria-label={day.long}>{day.narrow}</th>
              {/each}
            </tr>
          </thead>
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
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
