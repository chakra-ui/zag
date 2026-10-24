<script lang="ts">
  import * as datePicker from "@zag-js/date-picker"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let nextField: HTMLInputElement | undefined = $state()

  const id = $props.id()
  const service = useMachine(datePicker.machine, {
    id,
    locale: "en",
    onValueChange() {
      nextField?.focus()
    },
  })

  const api = $derived(datePicker.connect(service, normalizeProps))
</script>

<main class="date-picker">
  <div {...api.getControlProps()}>
    <input {...api.getInputProps()} />
    <button {...api.getTriggerProps()}>🗓</button>
  </div>
  <input bind:this={nextField} data-testid="next-field" placeholder="Next field" />
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <table {...api.getTableProps({ view: "day" })}>
        <tbody {...api.getTableBodyProps({ view: "day" })}>
          {#each api.weeks as week}
            <tr {...api.getTableRowProps({ view: "day" })}>
              {#each week as value}
                <td {...api.getDayTableCellProps({ value })}>
                  <div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</main>
