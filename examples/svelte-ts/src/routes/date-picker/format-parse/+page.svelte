<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { CalendarDate, type DateValue } from "@internationalized/date"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  // parse dd/mm/yy to DateValue
  const parse = (value: string) => {
    // Handle full dd/mm/yy format
    const fullRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/
    const fullMatch = value.match(fullRegex)
    if (fullMatch) {
      const [_, day, month, year] = fullMatch.map(Number)
      try {
        return new CalendarDate(year + 2000, month, day)
      } catch {
        return undefined
      }
    }

    // Handle dd/mm format
    const partialRegex = /^(\d{1,2})\/(\d{1,2})$/
    const partialMatch = value.match(partialRegex)
    if (partialMatch) {
      const [_, day, month] = partialMatch.map(Number)
      const currentYear = new Date().getFullYear()
      try {
        return new CalendarDate(currentYear, month, day)
      } catch {
        return undefined
      }
    }

    // Handle dd format
    const dayRegex = /^(\d{1,2})$/
    const dayMatch = value.match(dayRegex)
    if (dayMatch) {
      const [_, day] = dayMatch.map(Number)
      const currentYear = new Date().getFullYear()
      return new CalendarDate(currentYear, 1, day)
    }

    return undefined
  }

  // convert DateValue to dd/mm/yy
  const format = (date: DateValue) => {
    const day = date.day.toString().padStart(2, "0")
    const month = date.month.toString().padStart(2, "0")
    const year = (date.year % 100).toString().padStart(2, "0")
    return `${day}/${month}/${year}`
  }

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    selectionMode: "single",
    parse,
    format,
    placeholder: "dd/mm/yy",
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
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
            <button {...api.getPrevTriggerProps({ view: "month" })}>Prev</button>
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
            <button {...api.getPrevTriggerProps({ view: "year" })}>Prev</button>
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
