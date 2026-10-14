<script lang="ts">
  import MenuComboboxSearch from "$lib/components/menu-combobox-search.svelte"
  import Portal from "$lib/components/portal.svelte"
  import type * as combobox from "@zag-js/combobox"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"
  import "@styles/combobox.css"

  const id = $props.id()
  const menuService = useMachine(menu.machine, {
    id,
    composite: false,
  })

  const menuApi = $derived(menu.connect(menuService, normalizeProps))

  const onValueChange = ({ items }: combobox.ValueChangeDetails) => {
    console.log(JSON.stringify(items[0].label))
    menuApi.setOpen(false)
  }
</script>

<main>
  <div>
    <button {...menuApi.getTriggerProps()}>Actions ▾</button>
    {#if menuApi.open}
      <Portal>
        <div {...menuApi.getPositionerProps()}>
          <ul {...menuApi.getContentProps()}>
            <MenuComboboxSearch {onValueChange} />
          </ul>
        </div>
      </Portal>
    {/if}
  </div>
</main>
