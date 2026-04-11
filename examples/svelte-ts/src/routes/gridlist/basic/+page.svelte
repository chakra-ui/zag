<script lang="ts">
  import * as gridlist from "@zag-js/gridlist"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { gridListControls, gridListData } from "@zag-js/shared"
  import CheckIcon from "lucide-svelte/icons/check"
  import { useControls } from "$lib/use-controls.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  interface Mailbox {
    id: string
    name: string
    description: string
    badge: string
  }

  const controls = useControls(gridListControls)

  const collection = gridlist.collection<Mailbox>({
    items: gridListData,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  let lastAction = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(
    gridlist.machine,
    controls.mergeProps<gridlist.Props<Mailbox>>({
      id,
      collection,
      onAction({ value }) {
        const item = gridListData.find((d) => d.id === value)
        lastAction = item ? `Opened ${item.name}` : null
      },
    }),
  )

  const api = $derived(gridlist.connect(service, normalizeProps))
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Mailboxes</label>
      <div {...api.getContentProps()}>
        {#each gridListData as item}
          <div {...api.getItemProps({ item, focusOnHover: true })}>
            <div {...api.getCellProps()}>
              {#if api.hasCheckbox}
                <button {...api.getItemCheckboxProps({ item })}>
                  <CheckIcon {...api.getItemIndicatorProps({ item })} />
                </button>
              {/if}
              <div class="gridlist-item-body">
                <span {...api.getItemTextProps({ item })} class="gridlist-item-title">
                  {item.name}
                </span>
                <span class="gridlist-item-description">{item.description}</span>
              </div>
              <span class="gridlist-item-badge">{item.badge}</span>
            </div>
          </div>
        {/each}
        <div {...api.getEmptyProps()}>No mailboxes</div>
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Selected: <strong>{api.valueAsString || "none"}</strong>
      {#if lastAction}
        · {lastAction}{/if}
    </p>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>
