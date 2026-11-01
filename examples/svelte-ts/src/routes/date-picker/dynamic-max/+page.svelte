<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const id = $props.id()
  let selectedValue = $state<datePicker.DateValue[]>([])

  // Calculate max date based on the first selected date (start date)
  const maxDate = $derived.by(() => {
    const [start, end] = [...selectedValue].sort((a, b) => a.compare(b))
    if (start && !end) return start.add({ days: 3 })
  })

  const service = useMachine(datePicker.machine, (): datePicker.Props => ({
    id,
    locale: "en",
    selectionMode: "range",
    inline: true,
    max: maxDate,
    onValueChange: (details) => {
      selectedValue = details.value
    },
  }))

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main class="date-picker">
  <output class="date-output">
    <div>Selected: {api.valueAsString ?? "-"}</div>
    <div>Focused: {api.focusedValueAsString}</div>
  </output>
  <div {...api.getRootProps()}>
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
        <div {...api.getViewControlProps({ view: "day" })}>
          <button {...api.getPreviousTriggerProps()}>Prev</button>
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
                {#each week as value, i (i)}
                  <td {...api.getDayTableCellProps({ value })}>
                    <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div style="display: flex; gap: 40px">
        <div hidden={api.view !== "month"} style="width: 100%">
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
        <div hidden={api.view !== "year"} style="width: 100%">
          <div {...api.getViewControlProps({ view: "year" })}>
            <button {...api.getPreviousTriggerProps({ view: "year" })}>Prev</button>
            <span>{api.getDecade().start} - {api.getDecade().end}</span>
            <button {...api.getNextTriggerProps({ view: "year" })}>Next</button>
          </div>
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
  </div>
</main>
