<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  interface Item {
    label: string
    value: string
  }

  const frameworks: Item[] = [
    { label: "React", value: "react" },
    { label: "Solid", value: "solid" },
    { label: "Vue", value: "vue" },
  ]

  let value = $state<string[]>(["react"])
  let options = $state.raw(frameworks)

  const collection = $derived(
    select.collection({
      items: options,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, () => ({
    id,
    collection,
    value,
    onValueChange: (e: select.ValueChangeDetails<Item>) => {
      value = e.value
    },
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
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
              {#each options as item (item.value)}
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

    <button data-testid="filter-vue-button" onclick={() => (options = [frameworks[2]])}>Filter to Vue</button>
    <button
      data-testid="set-solid-button"
      onclick={() => {
        options = frameworks
        value = ["solid"]
      }}
    >
      Set value to Solid
    </button>
  </div>
</main>
