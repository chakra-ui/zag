<script lang="ts">
  import { createFilter } from "@zag-js/i18n-utils"
  import * as menu from "@zag-js/menu"
  import { menuFilterData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"

  // Rendered only while its trigger matches the parent's query, so filtering the trigger out removes the submenu
  interface Props {
    id: string
    parentService: menu.Service
    parent: menu.Api
  }

  const props: Props = $props()

  const { contains } = createFilter({ sensitivity: "base" })
  let query = $state("")

  const service = useMachine(menu.machine, () => ({
    id: props.id,
    composite: false,
    onOpenChange(details) {
      if (!details.open) query = ""
    },
  }))

  const api = $derived(menu.connect(service, normalizeProps))
  const folders = $derived(menuFilterData.folders.filter((item) => contains(item.label, query)))
  const triggerItemProps = $derived(props.parent.getTriggerItemProps(api))
  const inputProps = $derived(
    mergeProps(api.getInputProps(), {
      value: query,
      oninput: (event: Event) => (query = (event.currentTarget as HTMLInputElement).value),
    }),
  )

  // Child components mount before their parent, so register once the parent's machine has started
  onMount(() => {
    queueMicrotask(() => {
      props.parent.setChild(service)
      api.setParent(props.parentService)
    })
  })
</script>

<div data-testid="move-to-folder" {...triggerItemProps}>Move to folder →</div>

<div use:portal {...api.getPositionerProps()}>
  <div data-testid="folders-submenu" {...api.getContentProps()}>
    <input data-testid="folders-input" aria-label="Filter folders" placeholder="Search folders..." {...inputProps} />
    {#if folders.length === 0}
      <div data-menu-empty>No folders found</div>
    {/if}
    <div {...api.getListProps()}>
      {#each folders as item (item.value)}
        <div data-testid={item.value} {...api.getItemProps({ value: item.value })}>{item.label}</div>
      {/each}
    </div>
  </div>
</div>
