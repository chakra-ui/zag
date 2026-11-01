<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  interface Item {
    label: string
    value: string
  }

  const items: Item[] = [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Solid", value: "solid" },
  ]

  const value = ["react"]

  const collection = select.collection({
    items,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, {
    id,
    collection,
    value,
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
    <div style="font-size: 0.875rem">
      <strong>Value (controlled, fixed):</strong>
      {value.join(", ")}
    </div>
    <div data-testid="selected-items" style="font-size: 0.875rem">
      <strong>Selected items (from api):</strong>
      {api.selectedItems.map((item) => item.label).join(", ")}
    </div>

    <div {...api.getRootProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select framework</label>
      <div {...mergeProps(api.getControlProps(), { style: { display: "flex", marginTop: "4px" } })}>
        <button data-testid="trigger" {...mergeProps(api.getTriggerProps(), { style: { flex: 1 } })}>
          <span>{api.valueAsString || "Select option"}</span>
          <span {...api.getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div data-testid="select-content" {...mergeProps(api.getContentProps(), { style: { padding: "4px" } })}>
            <div {...api.getListProps()}>
              {#each items as item (item.value)}
                <div
                  data-testid={item.value}
                  {...mergeProps(api.getItemProps({ item }), { style: { padding: "8px 12px" } })}
                >
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </Portal>
    </div>
  </div>
</main>
