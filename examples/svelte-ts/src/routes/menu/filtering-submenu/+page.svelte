<script lang="ts">
  import { createFilter } from "@zag-js/i18n-utils"
  import * as menu from "@zag-js/menu"
  import { menuFilterData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import FolderSubmenu from "#lib/components/menu-folder-submenu.svelte"
  import "@styles/menu.css"

  const { contains } = createFilter({ sensitivity: "base" })
  let query = $state("")

  const id = $props.id()
  const folderMenuId = `${id}-folders`

  const service = useMachine(menu.machine, {
    id,
    popupType: "dialog",
    onOpenChange(details) {
      if (!details.open) query = ""
    },
  })

  const api = $derived(menu.connect(service, normalizeProps))
  const actions = $derived(menuFilterData.actions.filter((item) => contains(item.label, query)))
  const showMoveTo = $derived(contains("Move to folder", query))
  const inputProps = $derived(
    mergeProps(api.getInputProps(), {
      value: query,
      oninput: (event: Event) => (query = (event.currentTarget as HTMLInputElement).value),
    }),
  )
</script>

<main>
  <div>
    <button data-testid="trigger" {...api.getTriggerProps()}>File</button>

    <Portal>
      <div {...api.getPositionerProps()}>
        <div data-testid="menu" {...api.getContentProps()}>
          <input data-testid="input" aria-label="Filter actions" placeholder="Search actions..." {...inputProps} />
          <div {...api.getEmptyProps()}>
            {#if actions.length === 0 && !showMoveTo}No actions found{/if}
          </div>
          <div {...api.getListProps()}>
            {#each actions as item (item.value)}
              <div data-testid={item.value} {...api.getItemProps({ value: item.value })}>{item.label}</div>
            {/each}
            {#if showMoveTo}
              <FolderSubmenu id={folderMenuId} parentService={service} parent={api} />
            {/if}
          </div>
        </div>
      </div>
    </Portal>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
