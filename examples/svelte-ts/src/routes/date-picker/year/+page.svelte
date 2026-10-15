<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as datePicker from "@zag-js/date-picker"
  import type { DateValue } from "@internationalized/date"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const format = (date: DateValue) => {
    const year = date.year.toString()
    return year
  }

  const parse = (string: string) => {
    if (string === "") return
    // account for yy
    const year = Number(string)
    if (year < 100) {
      const currentYear = new Date().getFullYear()
      const currentCentury = Math.floor(currentYear / 100) * 100
      return datePicker.parse(new Date(currentCentury + year, 0))
    }
    return string ? datePicker.parse(new Date(Number(string), 0)) : undefined
  }

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    view: "year",
    minView: "year",
    placeholder: "yyyy",
    format,
    parse,
    onValueChange(details) {
      console.log(details)
    },
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
<Toolbar viz>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
