<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const id = $props.id()
  let open = $state(false)

  const service = useMachine(datePicker.machine, (): datePicker.Props => ({
    id,
    locale: "en",
    numOfMonths: 2,
    selectionMode: "range",
    open,
    onOpenChange: (details) => (open = details.open),
  }))

  const api = $derived(datePicker.connect(service, normalizeProps))

  const offset = $derived(api.getOffset({ months: 1 }))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>DateRange Picker Controlled</h1>
  <h1>{String(open)}</h1>
  <div style="display: flex; gap: 12px; margin-bottom: 24px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>
  </div>
  <main class="date-picker">
    <p>{`Visible range: ${api.visibleRangeText.formatted}`}</p>
    <output class="date-output">
      <div>Selected: {api.valueAsString ?? "-"}</div>
      <div>Focused: {api.focusedValueAsString}</div>
    </output>
    <div {...api.getControlProps()}>
      <input {...api.getInputProps({ index: 0 })} />
      <input {...api.getInputProps({ index: 1 })} />
      <button {...api.getClearTriggerProps()}>❌</button>
      <button {...api.getTriggerProps()}>🗓</button>
    </div>
    <div {...api.getContentProps()}>
      <div style="margin-bottom: 20px">
        <select {...api.getMonthSelectProps()}>
          {#each api.getMonths() as month, i (i)}
            <option value={i + 1} disabled={month.disabled}>{month.label}</option>
          {/each}
        </select>
        <select {...api.getYearSelectProps()}>
          {#each api.getYears() as year, i (i)}
            <option value={year.value} disabled={year.disabled}>{year.label}</option>
          {/each}
        </select>
      </div>
      <div>
        <div {...api.getViewControlProps({ view: "year" })}>
          <button {...api.getPreviousTriggerProps()}>Prev</button>
          <span>{api.visibleRangeText.start} - {api.visibleRangeText.end}</span>
          <button {...api.getNextTriggerProps()}>Next</button>
        </div>
        <div style="display: flex; gap: 24px">
          <table {...api.getTableProps({ id: "r1" })}>
            <thead {...api.getTableHeaderProps()}>
              <tr {...api.getTableRowProps()}>
                {#each api.weekDays as day, i (i)}
                  <th scope="col" aria-label={day.long}>{day.narrow}</th>
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
          <table {...api.getTableProps({ id: "r2" })}>
            <thead {...api.getTableHeaderProps()}>
              <tr {...api.getTableRowProps()}>
                {#each api.weekDays as day, i (i)}
                  <th scope="col" aria-label={day.long}>{day.narrow}</th>
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
        </div>
      </div>
    </div>
  </main>
</div>
