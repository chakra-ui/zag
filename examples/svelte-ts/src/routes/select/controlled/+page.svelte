<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  const collection = select.collection({
    items: selectData,
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  })

  let open = $state(false)
  let value = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(select.machine, () => ({
    id,
    collection,
    value: value ? [value] : undefined,
    open,
    onValueChange: (details: select.ValueChangeDetails) => {
      value = details.value[0] ?? null
    },
    onOpenChange: (details: select.OpenChangeDetails) => {
      open = details.open
    },
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<div style="padding: 40px">
  <h1>{value || "-"}</h1>

  <div style="display: flex; gap: 12px; margin-bottom: 24px">
    <button onclick={() => (value = selectData[0].value)}>Change to {selectData[0].label}</button>
    <button onclick={() => (value = selectData[1].value)}>Change to {selectData[1].label}</button>
  </div>

  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Label</label>
      <button {...api.getTriggerProps()}>
        <span>{api.valueAsString || "Select a country"}</span>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <ul {...api.getListProps()}>
            {#each selectData as item (item.value)}
              <li {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </Portal>
  </div>
</div>
