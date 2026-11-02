<script lang="ts">
  import { goto } from "$app/navigation"
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

  const id = $props.id()
  const service = useMachine(select.machine, {
    id,
    collection,
  })

  const api = $derived(select.connect(service, normalizeProps))
</script>

<div style="padding-block: 32px; max-width: 400px">
  <div style="display: flex; flex-direction: column; gap: 12px">
    <h1>Page</h1>

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

    <button type="button" onclick={() => goto("/")}>Go to main page</button>
    <button type="button" onclick={() => goto("/")}>Go to main page</button>
    <button type="button" onclick={() => goto("/")}>Go to main page</button>
  </div>
</div>
