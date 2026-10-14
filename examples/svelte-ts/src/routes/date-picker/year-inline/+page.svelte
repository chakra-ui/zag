<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { parseDate } from "@internationalized/date"

  // an inline year view that renders beyond the decade in view, with min 2015 and max 2035

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    defaultView: "year",
    inline: true,
    min: parseDate("2015-01-01"),
    max: parseDate("2035-12-31"),
  })
  const api = $derived(datePicker.connect(service, normalizeProps))

  const decade = $derived(api.getDecade())
  const start = $derived((decade.start ?? 2020) - 10)
  const years = $derived(Array.from({ length: 30 }, (_, i) => ({ label: String(start + i), value: start + i })))
</script>

<main>
  <div data-testid="decade">{`${decade.start}-${decade.end}`}</div>
  <div data-testid="selected">{api.valueAsString.join(",") || "none"}</div>
  <div {...api.getContentProps()}>
    <table {...api.getTableProps({ view: "year", columns: 5 })}>
      <tbody {...api.getTableBodyProps()}>
        {#each Array.from({ length: 6 }, (_, row) => row) as row (row)}
          <tr {...api.getTableRowProps({ view: "year" })}>
            {#each years.slice(row * 5, row * 5 + 5) as year (year.value)}
              <td {...api.getYearTableCellProps({ ...year, columns: 5 })}>
                <div {...api.getYearTableCellTriggerProps({ ...year, columns: 5 })}>{year.label}</div>
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</main>
