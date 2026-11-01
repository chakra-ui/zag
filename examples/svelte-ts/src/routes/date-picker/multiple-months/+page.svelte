<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    selectionMode: "single",
    numOfMonths: 2,
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
      <div style="display: flex; gap: 10px">
        <button {...api.getPreviousTriggerProps()}>Prev</button>
        <button {...api.getNextTriggerProps()}>Next</button>
      </div>
      <hr />
      <div>{api.visibleRangeText.start}</div>
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
              {#each week as value, i (i)}
                <td {...api.getDayTableCellProps({ value })}>
                  <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
      <hr />
      <div>{offset.visibleRangeText.start}</div>
      <table {...api.getTableProps({ view: "day" })}>
        <thead {...api.getTableHeaderProps()}>
          <tr {...api.getTableRowProps()}>
            {#each api.weekDays as day, i (i)}
              <th scope="col" aria-label={day.long}>{day.narrow}</th>
            {/each}
          </tr>
        </thead>
        <tbody {...api.getTableBodyProps({ view: "day" })}>
          {#each offset.weeks as week, i (i)}
            <tr {...api.getTableRowProps({ view: "day" })}>
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
    <div style="display: flex; gap: 40px">
      <div {...api.getViewProps({ view: "month" })}>
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
      <div {...api.getViewProps({ view: "year" })}>
        <table {...api.getTableProps({ view: "year", columns: 4 })}>
          <tbody {...api.getTableBodyProps()}>
            {#each api.getYearsGrid({ columns: 4 }) as years, row (row)}
              <tr {...api.getTableRowProps({ view: "year" })}>
                {#each years as year, index (index)}
                  <td {...api.getYearTableCellProps({ ...year, columns: 4 })}>
                    <div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })}>{year.label}</div>
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
