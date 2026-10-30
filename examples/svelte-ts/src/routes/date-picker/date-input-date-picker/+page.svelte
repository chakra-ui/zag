<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dateInput from "@zag-js/date-input"
  import * as datePicker from "@zag-js/date-picker"
  import { getLocalTimeZone } from "@internationalized/date"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/date-picker.css"

  const timeZone = getLocalTimeZone()

  const id = $props.id()
  const datePickerService = useMachine(datePicker.machine, {
    id,
    locale: "en",
    selectionMode: "single",
    timeZone,
  })

  const datePickerApi = $derived(datePicker.connect(datePickerService, normalizeProps))
  const pickerValue = $derived(datePickerApi.value)

  const dateInputService = useMachine(dateInput.machine, (): dateInput.Props => ({
    id: `${id}-input`,
    locale: "en",
    selectionMode: "single",
    timeZone,
    value: pickerValue,
    onValueChange(details) {
      datePickerApi.setValue(details.value)
    },
  }))

  const dateInputApi = $derived(dateInput.connect(dateInputService, normalizeProps))
</script>

<main class="date-input date-picker">
  <output class="date-output">
    <div>Selected: {datePickerApi.valueAsString ?? "-"}</div>
  </output>
  <div {...datePickerApi.getControlProps()} style="display: flex; align-items: center; gap: 8px">
    <div {...dateInputApi.getRootProps()}>
      <label {...dateInputApi.getLabelProps()}>Date</label>
      <div {...dateInputApi.getControlProps()}>
        <div {...dateInputApi.getSegmentGroupProps()}>
          {#each dateInputApi.getSegments() as segment, i (i)}
            <span {...dateInputApi.getSegmentProps({ segment })}>{segment.text}</span>
          {/each}
        </div>
      </div>
    </div>
    <button {...datePickerApi.getTriggerProps()}>📅</button>
    <button {...datePickerApi.getClearTriggerProps()}>Clear</button>
  </div>
  <div {...datePickerApi.getPositionerProps()}>
    <div {...datePickerApi.getContentProps()}>
      <div style="margin-bottom: 20px">
        <select {...datePickerApi.getMonthSelectProps()}>
          {#each datePickerApi.getMonths() as month, i (i)}
            <option value={month.value} disabled={month.disabled}>{month.label}</option>
          {/each}
        </select>
        <select {...datePickerApi.getYearSelectProps()}>
          {#each datePickerApi.getYears() as year, i (i)}
            <option value={year.value} disabled={year.disabled}>{year.label}</option>
          {/each}
        </select>
      </div>
      <div hidden={datePickerApi.view !== "day"}>
        <div {...datePickerApi.getViewControlProps({ view: "year" })}>
          <button {...datePickerApi.getPreviousTriggerProps()}>Prev</button>
          <button {...datePickerApi.getViewTriggerProps()}>{datePickerApi.visibleRangeText.start}</button>
          <button {...datePickerApi.getNextTriggerProps()}>Next</button>
        </div>
        <table {...datePickerApi.getTableProps({ view: "day" })}>
          <thead {...datePickerApi.getTableHeaderProps({ view: "day" })}>
            <tr {...datePickerApi.getTableRowProps({ view: "day" })}>
              {#each datePickerApi.weekDays as day, i (i)}
                <th scope="col" aria-label={day.long}>{day.narrow}</th>
              {/each}
            </tr>
          </thead>
          <tbody {...datePickerApi.getTableBodyProps({ view: "day" })}>
            {#each datePickerApi.weeks as week, i (i)}
              <tr {...datePickerApi.getTableRowProps({ view: "day" })}>
                {#each week as value, i (i)}
                  <td {...datePickerApi.getDayTableCellProps({ value })}>
                    <div {...datePickerApi.getDayTableCellTriggerProps({ value })}>{value.day}</div>
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
  <StateVisualizer state={datePickerService} omit={["weeks"]} />
</Toolbar>
