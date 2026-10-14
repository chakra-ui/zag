<script lang="ts">
  import ComboboxCommandMenu from "$lib/components/combobox-command-menu.svelte"
  import Portal from "$lib/components/portal.svelte"
  import * as combobox from "@zag-js/combobox"
  import * as dialog from "@zag-js/dialog"
  import { createFilter } from "@zag-js/i18n-utils"
  import { commandData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/combobox.css"
  import "@styles/dialog.css"

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
  const service = useMachine(dialog.machine, { id })
  const dialogApi = $derived(dialog.connect(service, normalizeProps))

  $effect(() => {
    const fn = (event: KeyboardEvent) => {
      if (dialogApi.open) return

      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
      const hotkey = isMac ? "metaKey" : "ctrlKey"

      if (event.key?.toLowerCase() === "k" && event[hotkey]) {
        event.preventDefault()
        dialogApi.setOpen(true)
      }
    }
    document.addEventListener("keydown", fn, true)
    return () => {
      document.removeEventListener("keydown", fn, true)
    }
  })
</script>

<main>
  <button {...dialogApi.getTriggerProps()}>Open Command Menu</button>
  <div style="background: lightgray; padding: 12px">
    or press <kbd> Cmd+K</kbd>
  </div>

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
