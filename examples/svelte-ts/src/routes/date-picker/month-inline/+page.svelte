<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { parseDate } from "@internationalized/date"

  // an inline month view constrained to march through september

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    defaultView: "month",
    minView: "month",
    inline: true,
    defaultFocusedValue: parseDate("2026-06-01"),
    min: parseDate("2026-03-01"),
    max: parseDate("2026-09-30"),
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main>
  <div data-testid="selected">{api.valueAsString.join(",") || "none"}</div>
  <div data-testid="focused">{api.focusedValueAsString}</div>
  <div {...api.getContentProps()}>
    <table {...api.getTableProps({ view: "month", columns: 4 })}>
      <tbody {...api.getTableBodyProps()}>
        {#each api.getMonthsGrid({ columns: 4, format: "short" }) as months, row (row)}
          <tr {...api.getTableRowProps({ view: "month" })}>
            {#each months as month (month.value)}
              <td {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
                <div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>{month.label}</div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
