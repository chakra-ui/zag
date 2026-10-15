<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const pad = (value: number) => String(value).padStart(2, "0")

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    selectionMode: "single",
    closeOnSelect: false,
  })

  const api = $derived(datePicker.connect(service, normalizeProps))

  // Get time from the selected value (if it has time components)
  const value = $derived(api.value[0])
  const hasTime = $derived(value && "hour" in value)
  const timeValue = $derived(hasTime ? `${pad((value as any).hour)}:${pad((value as any).minute)}` : "12:00")

  const handleTimeChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const [hours, minutes] = e.currentTarget.value.split(":").map(Number)
    if (!isNaN(hours) && !isNaN(minutes)) {
      api.setTime({ hour: hours, minute: minutes, second: 0 })
    }
  }

  // Format the full date-time string
  const dateTimeString = $derived(
    value
      ? hasTime
        ? `${value.year}-${pad(value.month)}-${pad(value.day)} ${pad((value as any).hour)}:${pad((value as any).minute)}`
        : `${value.year}-${pad(value.month)}-${pad(value.day)}`
      : "-",
  )
</script>

<main class="date-picker">
  <div>
    <h2>Date-Time Picker Example</h2>
    <p>Combines Zag date picker with native time input using the new setTime API</p>
  </div>
  <output class="date-output">
    <div>Selected DateTime: {dateTimeString}</div>
    <div>Has Time: {hasTime ? "Yes" : "No"}</div>
  </output>
  <div {...api.getControlProps()} style="display: flex; gap: 8px; align-items: center; margin-bottom: 16px">
    <!-- Date-Time Trigger -->
    <button {...api.getTriggerProps()}>
      {value
        ? hasTime
          ? `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")} ${String((value as any).hour).padStart(2, "0")}:${String((value as any).minute).padStart(2, "0")}`
          : `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`
        : "Select Date & Time"}
    </button>
    <!-- Clear Button -->
    <button {...api.getClearTriggerProps()}>Clear</button>
  </div>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <!-- Day View -->
      <div hidden={api.view !== "day"}>
        <div {...api.getViewControlProps({ view: "year" })}>
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
        <!-- Time Picker inside content -->
        <div
          style="border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 12px; display: flex; align-items: center; gap: 8px"
        >
          <label style="font-size: 14px; font-weight: 500">Time:</label>
          <input
            type="time"
            value={timeValue}
            oninput={handleTimeChange}
            disabled={!value}
            style="padding: 6px 8px; font-size: 14px; border: 1px solid #e2e8f0; border-radius: 4px; flex: 1"
          />
        </div>
      </div>
      <!-- Month View -->
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
      <!-- Year View -->
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
</main>
<Toolbar viz>
  <StateVisualizer state={service} omit={["weeks"]} />
</Toolbar>
