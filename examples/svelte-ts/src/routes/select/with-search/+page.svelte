<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import { createFilter } from "@zag-js/i18n-utils"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronsUpDownIcon } from "lucide-svelte"
  import "@styles/select.css"

  const { contains } = createFilter({ sensitivity: "base" })

  interface Item {
    label: string
    value: string
  }

  let search = $state("")

  const collection = $derived(
    select.collection({
      items: selectData.filter((item) => contains(item.label, search)),
    }),
  )

  const id = $props.id()
  const service = useMachine(select.machine as select.Machine<Item>, () => ({
    id,
    collection,
    popupType: "dialog" as const,
    onOpenChange(details: select.OpenChangeDetails) {
      if (!details.open) search = ""
    },
  }))

  const api = $derived(select.connect(service, normalizeProps))
</script>

<main class="select">
  <div {...api.getRootProps()}>
    <div {...api.getControlProps()}>
      <!-- svelte-ignore a11y_label_has_associated_control -->
      <label {...api.getLabelProps()}>Country</label>
      <button {...api.getTriggerProps()}>
        <span {...api.getValueTextProps()}>{api.valueAsString || "Select country"}</span>
        <span {...api.getIndicatorProps()}>
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <input
            {...api.getInputProps()}
            aria-label="Filter countries"
            placeholder="Filter…"
            value={search}
            oninput={(e) => (search = e.currentTarget.value)}
          />

          <div {...api.getListProps()}>
            {#each collection.items as item (item.value)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>

          <div {...api.getEmptyProps()}>{collection.size === 0 ? `No matches for "${search}"` : ""}</div>

          <div data-select-footer="">
            <span>
              {collection.size} of {selectData.length}
            </span>
            {#if api.hasSelectedItems}
              <button type="button" onclick={() => api.clearValue()}>Clear</button>
            {/if}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>
