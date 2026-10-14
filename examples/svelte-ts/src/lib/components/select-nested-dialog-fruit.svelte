<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import * as select from "@zag-js/select"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"

  const items = ["Apple", "Banana", "Cherry"]

  const id = $props.id()
  const service = useMachine(select.machine, {
    id,
    collection: select.collection({ items }),
  })
  const api = $derived(select.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label {...api.getLabelProps()}>Fruit</label>
  <button {...api.getTriggerProps()} data-testid="select-trigger">
    <span>{api.valueAsString || "Select fruit"}</span>
    <span {...api.getIndicatorProps()}>
      <ChevronsUpDownIcon />
    </span>
  </button>
  <Portal>
    <Presence {...api.getPositionerProps()} hidden={!api.open} lazyMount unmountOnExit data-testid="select-positioner">
      <div {...api.getContentProps()} hidden={false} data-testid="select-content">
        <div {...api.getListProps()} data-testid="select-list">
          {#each items as item (item)}
            <div {...api.getItemProps({ item })}>
              <span {...api.getItemTextProps({ item })}>{item}</span>
            </div>
          {/each}
        </div>
      </div>
    </Presence>
  </Portal>
</div>
