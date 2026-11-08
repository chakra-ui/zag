<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  const rootItems = [
    { label: "New File", value: "new-file" },
    { label: "Share →", value: "share" },
    { label: "Export →", value: "export" },
    { label: "Delete", value: "delete" },
  ]

  const submenuItems: Record<string, { label: string; value: string }[]> = {
    share: [
      { label: "Email", value: "email" },
      { label: "Copy Link", value: "copy-link" },
    ],
    export: [
      { label: "PDF", value: "pdf" },
      { label: "PNG", value: "png" },
    ],
  }

  const id = $props.id()

  let rootOpen = $state(false)
  const rootService = useMachine(menu.machine, () => ({
    id,
    open: rootOpen,
    onOpenChange: (details) => (rootOpen = details.open),
  }))
  const root = $derived(menu.connect(rootService, normalizeProps))

  let shareOpen = $state(false)
  const shareService = useMachine(menu.machine, () => ({
    id: `${id}-share`,
    open: shareOpen,
    onOpenChange: (details) => (shareOpen = details.open),
  }))
  const share = $derived(menu.connect(shareService, normalizeProps))

  let exportOpen = $state(false)
  const exportService = useMachine(menu.machine, () => ({
    id: `${id}-export`,
    open: exportOpen,
    onOpenChange: (details) => (exportOpen = details.open),
  }))
  const exportMenu = $derived(menu.connect(exportService, normalizeProps))

  const submenus = $derived([
    { value: "share", service: shareService, api: share },
    { value: "export", service: exportService, api: exportMenu },
  ])

  onMount(() => {
    submenus.forEach(({ service, api }) => {
      root.setChild(service)
      api.setParent(rootService)
    })
  })

  function getRootItemProps(value: string) {
    const sub = submenus.find((s) => s.value === value)
    return sub ? root.getTriggerItemProps(sub.api) : root.getItemProps({ value })
  }
</script>

<main>
  <div>
    <button data-testid="trigger" {...root.getTriggerProps()}>Click me</button>

    <Portal>
      <div {...root.getPositionerProps()}>
        <ul data-testid="menu" {...root.getContentProps()}>
          {#each rootItems as item (item.value)}
            <li data-testid={item.value} {...getRootItemProps(item.value)}>
              {item.label}
            </li>
          {/each}
        </ul>
      </div>
    </Portal>

    {#each submenus as sub (sub.value)}
      <Portal>
        <div {...sub.api.getPositionerProps()}>
          <ul data-testid={`${sub.value}-submenu`} {...sub.api.getContentProps()}>
            {#each submenuItems[sub.value] as item (item.value)}
              <li data-testid={item.value} {...sub.api.getItemProps({ value: item.value })}>
                {item.label}
              </li>
            {/each}
          </ul>
        </div>
      </Portal>
    {/each}
  </div>
</main>

<Toolbar>
  <StateVisualizer state={rootService} label="Root Machine" />
  <StateVisualizer state={shareService} label="Share Machine" />
  <StateVisualizer state={exportService} label="Export Machine" />
</Toolbar>
