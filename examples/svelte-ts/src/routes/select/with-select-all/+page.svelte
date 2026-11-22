<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  interface Item {
    label: string
    value: string
  }

  const collection = select.collection({ items: selectData })

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, {
    id,
    collection,
    multiple: true,
    closeOnSelect: false,
  })

  const api = $derived(select.connect(service, normalizeProps))

  const selectAll = $derived(api.getSelectAllState())
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Countries</label>
      <button {...api.getTriggerProps()}>
        <span>{api.hasSelectedItems ? `${api.value.length} selected` : "Select countries"}</span>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getListProps()}>
            <!-- Stays in view: only the items below it scroll -->
            <div {...api.getSelectAllProps()}>
              <span class="select-check" aria-hidden="true">
                {selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : ""}
              </span>
              <span>{selectAll.checked ? "Deselect all" : "Select all"}</span>
              <span data-select-select-all-count="">
                {api.value.length} / {collection.size}
              </span>
            </div>
            <div class="select-items">
              {#each selectData as item (item.value)}
                <div {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
