<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as datePicker from "@zag-js/date-picker"
  import { datePickerControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(datePickerControls)

  const service = useMachine(datePicker.machine, {
    id: "1",
    name: "date[]",
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
  const offset = $derived(api.getOffset({ months: 1 }))
</script>

<main class="date-picker">
  <div>
    <button>Outside Element</button>
  </div>
  <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>

  <output class="date-output">
    <div>Selected: {api.valueAsString.join(", ") ?? "-"}</div>
    <div>Focused: {api.focusedValueAsString}</div>
  </output>

  <div {...api.getControlProps()}>
    <input {...api.getInputProps({ index: 0 })} />
    <input {...api.getInputProps({ index: 1 })} />
    <button {...api.getClearTriggerProps()}>❌</button>
    <button {...api.getTriggerProps()}>🗓</button>
  </div>

  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <div style="margin-bottom: 20px">
        <select {...api.getMonthSelectProps()}>
          {#each api.getMonths() as month, i (i)}
            <option value={month.value}>{month.label}</option>
          {/each}
        </select>

        <select {...api.getYearSelectProps()}>
          {#each api.getYears() as year, i (i)}
            <option value={year.value}>{year.label}</option>
          {/each}
        </select>
      </div>

      <div>
        <div {...api.getViewControlProps({ view: "year" })}>
          <button {...api.getPrevTriggerProps()}>Prev</button>

          <span>
            {api.visibleRangeText.start} - {api.visibleRangeText.end}
          </span>

          <button {...api.getNextTriggerProps()}>Next</button>
        </div>

        <div style="display: flex; gap: 24px;">
          <table {...api.getTableProps({ id: "0" })}>
            <thead {...api.getTableHeaderProps()}>
              <tr {...api.getTableRowProps()}>
                {#each api.weekDays as day, i (i)}
                  <th scope="col" aria-label={day.long}>
                    {day.narrow}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody {...api.getTableBodyProps()}>
              {#each api.weeks as week, i (i)}
                <tr {...api.getTableRowProps()}>
                  {#each week as value, i (i)}
                    <td {...api.getDayTableCellProps({ value })}>
                      <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>

          <table {...api.getTableProps({ id: "1" })}>
            <thead {...api.getTableHeaderProps()}>
              <tr {...api.getTableRowProps()}>
                {#each api.weekDays as day, i (i)}
                  <th scope="col" aria-label={day.long}>
                    {day.narrow}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody {...api.getTableBodyProps()}>
              {#each offset.weeks as week, i (i)}
                <tr {...api.getTableRowProps()}>
                  {#each week as value, i (i)}
                    <td {...api.getDayTableCellProps({ value, visibleRange: offset.visibleRange })}>
                      <div {...api.getDayTableCellTriggerProps({ value, visibleRange: offset.visibleRange })}>
                        {value.day}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>

          <div style="min-width:80px; display: flex; flex-direction: column; gap: 4px;">
            <b>Presets</b>
            <button {...api.getPresetTriggerProps({ value: "last3Days" })}>Last 3 Days</button>
            <button {...api.getPresetTriggerProps({ value: "last7Days" })}>Last 7 Days</button>
            <button {...api.getPresetTriggerProps({ value: "last14Days" })}>Last 14 Days</button>
            <button {...api.getPresetTriggerProps({ value: "last30Days" })}>Last 30 Days</button>
            <button {...api.getPresetTriggerProps({ value: "last90Days" })}>Last 90 Days</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar viz {controls}>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
