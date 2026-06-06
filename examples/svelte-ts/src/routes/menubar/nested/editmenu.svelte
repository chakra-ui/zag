<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { getContext, onMount } from "svelte"

  const menubarContext = getContext<menu.MenubarContext | undefined>("menubar")
  const service = useMachine(menu.machine, { id: "edit", menubar: menubarContext })
  const api = $derived(menu.connect(service, normalizeProps))

  // The submenu is not a menubar menu (no `menubar` prop) — it's linked via setParent/setChild.
  const subService = useMachine(menu.machine, { id: "find" })
  const sub = $derived(menu.connect(subService, normalizeProps))

  onMount(() => {
    api.setChild(subService)
    sub.setParent(service)
  })
</script>

<button data-testid="edit:trigger" {...api.getTriggerProps()}>Edit</button>
{#if api.open}
  <div use:portal {...api.getPositionerProps()}>
    <ul data-testid="edit:content" {...api.getContentProps()}>
      <li data-testid="undo" {...api.getItemProps({ value: "undo" })}>Undo</li>
      <li data-testid="redo" {...api.getItemProps({ value: "redo" })}>Redo</li>
      <li data-testid="find:trigger" {...api.getTriggerItemProps(sub)}>Find ▸</li>
    </ul>
  </div>
{/if}
{#if sub.open}
  <div use:portal {...sub.getPositionerProps()}>
    <ul data-testid="find:content" {...sub.getContentProps()}>
      <li data-testid="find-text" {...sub.getItemProps({ value: "find-text" })}>Find...</li>
      <li data-testid="replace" {...sub.getItemProps({ value: "replace" })}>Replace...</li>
      <li data-testid="find-in-files" {...sub.getItemProps({ value: "find-in-files" })}>Find in Files...</li>
    </ul>
  </div>
{/if}
