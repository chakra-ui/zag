<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menu.machine, { id: `${id}-root` })
  const root = $derived(menu.connect(service, normalizeProps))

  const subService = useMachine(menu.machine, { id: `${id}-sub` })
  const sub = $derived(menu.connect(subService, normalizeProps))

  onMount(() => {
    root.setChild(subService)
    sub.setParent(service)
  })

  const triggerItemProps = $derived(root.getTriggerItemProps(sub))
</script>

<main>
  <div {...root.getContextTriggerProps()}>
    <div>Open context menu</div>
  </div>
  <Portal>
    <div {...root.getPositionerProps()}>
      <ul {...root.getContentProps()}>
        <li {...root.getItemProps({ value: "edit" })}>Edit</li>
        <li {...root.getItemProps({ value: "delete" })}>Delete</li>
        <li {...root.getItemProps({ value: "export" })}>Export</li>
        <li {...triggerItemProps}>
          <div>Appearance ➡️</div>
        </li>
        <li {...root.getItemProps({ value: "duplicate" })}>Duplicate</li>
      </ul>
    </div>
  </Portal>

  <Portal>
    <div {...sub.getPositionerProps()}>
      <ul {...sub.getContentProps()}>
        <li {...sub.getItemProps({ value: "full-screen" })}>Full screen</li>
        <li {...sub.getItemProps({ value: "zoom-in" })}>Zoom in</li>
        <li {...sub.getItemProps({ value: "zoom-out" })}>Zoom out</li>
      </ul>
    </div>
  </Portal>
</main>
