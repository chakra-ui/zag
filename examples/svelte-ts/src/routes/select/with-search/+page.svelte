<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { createFilter } from "@zag-js/i18n-utils"
  import * as select from "@zag-js/select"
  import { selectData } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import "@styles/select.css"

  const { contains } = createFilter({ sensitivity: "base" })

  let search = $state("")

  const collection = $derived(
    select.collection({
      items: selectData.filter((item) => contains(item.label, search)),
    }),
  )

  const id = $props.id()
  const service = useMachine(select.machine, (): select.Props => ({
    id,
    collection,
    popupType: "dialog",
    onOpenChange(details) {
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
        <span>{api.valueAsString || "Select country"}</span>
        <span {...api.getIndicatorProps()}>▼</span>
      </button>
    </div>

    <div use:portal {...api.getPositionerProps()}>
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

        <div {...api.getEmptyProps()}>
          {#if collection.size === 0}No matches for "{search}"{/if}
        </div>

        <div data-select-footer>
          <span>{collection.size} of {selectData.length}</span>
          {#if api.hasSelectedItems}
            <button type="button" onclick={() => api.clearValue()}>Clear</button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} omit={["collection"]} />
</Toolbar>
