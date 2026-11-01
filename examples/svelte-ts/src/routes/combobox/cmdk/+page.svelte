<script lang="ts">
  import ComboboxCommandMenu from "#lib/components/combobox-command-menu.svelte"
  import Portal from "#lib/components/portal.svelte"
  import * as combobox from "@zag-js/combobox"
  import * as dialog from "@zag-js/dialog"
  import { createHotkeyStore } from "@zag-js/hotkeys"
  import { createFilter } from "@zag-js/i18n-utils"
  import { commandData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/cmdk.css"

  const { allItems, commands, applications, suggestions } = commandData
  const { contains } = createFilter({ sensitivity: "base" })

  function filter(value: string): Record<string, commandData.Command[]> {
    if (!value) {
      return {
        Suggestions: suggestions,
        Commands: commands.filter((item) => !suggestions.includes(item)),
        Apps: applications.filter((item) => !suggestions.includes(item)),
      }
    }

    const results = allItems.filter((item) => contains(item.name, value) || contains(item.title, value))

    if (!results.length) return {}

    return { Results: results }
  }

  let inputValue = $state("")
  let selectedAction = $state<string | null>(null)

  const matches = $derived(filter(inputValue))
  const flatMatches = $derived(Object.values(matches).flat())

  const collection = $derived(
    combobox.collection({
      items: flatMatches,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.title,
    }),
  )

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    onOpenChange({ open }) {
      if (!open) inputValue = ""
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
            {matches}
            {collection}
            onValueChange={({ items }) => {
              selectedAction = JSON.stringify(items[0].title)
              dialogApi.setOpen(false)
            }}
            onInputValueChange={(details) => {
              inputValue = details.inputValue
            }}
          />
        </div>
      </div>
    </Portal>
  {/if}
</main>
