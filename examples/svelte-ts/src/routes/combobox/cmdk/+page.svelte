<script lang="ts">
  import ComboboxCommandMenu from "#lib/components/combobox-command-menu.svelte"
  import Portal from "#lib/components/portal.svelte"
  import { PageListCollection } from "@zag-js/collection"
  import * as dialog from "@zag-js/dialog"
  import { createHotkeyStore } from "@zag-js/hotkeys"
  import { commandData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/cmdk.css"

  type Item = commandData.PageItem

  const createCollection = () =>
    new PageListCollection<Item>({
      items: commandData.pageItems,
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
      groupBy: (item) => item.group,
    })

  let selectedAction = $state<string | null>(null)
  // raw: the collection is immutable and replaced on every change
  let pages = $state.raw(createCollection())
  let query = $state("")

  const navigate = (next: PageListCollection<Item>, nextQuery: string) => {
    pages = next
    query = nextQuery
  }

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    onEscapeKeyDown(event) {
      // Escape goes back a page before it closes the dialog
      if (!pages.canGoBack) return
      event.preventDefault()
      const next = pages.back(query)
      navigate(next, next.restore.query)
    },
    onOpenChange({ open }) {
      if (!open) navigate(pages.reset(), "")
    },
  })
  const dialogApi = $derived(dialog.connect(service, normalizeProps))

  $effect(() => {
    const store = createHotkeyStore()
    store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi.setOpen(true) })
    store.init({ target: document })
    return () => store.destroy()
  })
</script>

<main>
  <button {...dialogApi.getTriggerProps()}>Open Command Menu</button>
  <p>or press <kbd>/</kbd></p>

  {#if selectedAction}
    <div>
      <b>Selected Action:</b>
      {selectedAction}
    </div>
  {/if}

  {#if dialogApi.open}
    <Portal>
      <div {...dialogApi.getBackdropProps()}></div>
      <div {...dialogApi.getPositionerProps()}>
        <div {...dialogApi.getContentProps()}>
          <ComboboxCommandMenu
            {pages}
            {query}
            onNavigate={navigate}
            onQueryChange={(value) => (query = value)}
            onAction={(item) => {
              selectedAction = item.label
              dialogApi.setOpen(false)
            }}
          />
        </div>
      </div>
    </Portal>
  {/if}
</main>
