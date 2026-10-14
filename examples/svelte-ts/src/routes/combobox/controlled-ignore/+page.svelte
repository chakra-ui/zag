<script lang="ts">
  import * as combobox from "@zag-js/combobox"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"

  interface Item {
    label: string
    value: string
  }

  const items: Item[] = [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Solid", value: "solid" },
  ]

  // Controller IGNORES selection changes - value is always ["react"]
  const value = ["react"]

  const collection = combobox.collection({
    items,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const id = $props.id()
  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id,
    collection,
    value,
    multiple: true,
    openOnClick: true,
    // Intentionally NOT passing onValueChange - controller ignores all changes
  })

  const api = $derived(combobox.connect(service, normalizeProps))
</script>

<main class="combobox" style="padding: 2rem">
  <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
    <div style="font-size: 0.875rem">
      <strong>Value (controlled, fixed):</strong>
      {value.join(", ")}
    </div>
    <div data-testid="selected-items" style="font-size: 0.875rem">
      <strong>Selected items (from api):</strong>
      {api.selectedItems.map((item) => (typeof item === "string" ? item : item.label)).join(", ")}
    </div>
    <div style="font-size: 0.75rem; color: #666">
      Expected: both should show &quot;React&quot;. Bug: selectedItems may show &quot;React, Vue&quot; after selecting
      Vue.
    </div>

    <div>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Select framework</label>
      <div {...mergeProps(api.getControlProps(), { style: "display: flex; margin-top: 4px" })}>
        <input
          data-testid="input"
          {...mergeProps(api.getInputProps(), {
            style: "flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px",
          })}
        />
        <button data-testid="trigger" {...mergeProps(api.getTriggerProps(), { style: "padding: 8px" })}>▼</button>
      </div>
    </div>

    <div {...api.getPositionerProps()}>
      <div
        data-testid="combobox-content"
        {...mergeProps(api.getContentProps(), {
          style:
            "list-style: none; margin: 0; padding: 4px; border: 1px solid #ccc; border-radius: 4px; margin-top: 4px; max-height: 200px; overflow: auto",
        })}
      >
        <div {...api.getListProps()}>
          {#each items as item (item.value)}
            <div
              data-testid={item.value}
              {...mergeProps(api.getItemProps({ item }), { style: "padding: 8px 12px; cursor: pointer" })}
            >
              {item.label}
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</main>
