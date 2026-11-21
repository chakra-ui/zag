<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  let secondaryRef = $state<HTMLButtonElement | null>(null)
  let finalRef = $state<HTMLButtonElement | null>(null)

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id: `${id}-actions`,
    initialFocusEl: () => secondaryRef,
    finalFocusEl: () => finalRef,
  })
  const contextService = useMachine(menu.machine, {
    id: `${id}-context`,
    finalFocusEl: () => finalRef,
  })
  const noFocusService = useMachine(menu.machine, {
    id: `${id}-no-focus`,
    initialFocusEl: () => false,
  })

  const api = $derived(menu.connect(service, normalizeProps))
  const contextApi = $derived(menu.connect(contextService, normalizeProps))
  const noFocusApi = $derived(menu.connect(noFocusService, normalizeProps))
</script>

<main>
  <div style="display: flex; gap: 16px; align-items: center">
    <button data-testid="trigger" {...api.getTriggerProps()}>Actions</button>
    <button data-testid="no-focus-trigger" {...noFocusApi.getTriggerProps()}>No initial focus</button>
    <button bind:this={finalRef} data-testid="final-focus">Final focus target</button>
    <button data-testid="outside">Outside</button>
  </div>

  <div data-testid="context-trigger" {...contextApi.getContextTriggerProps()}>Right click here</div>

  <Portal>
    <div {...api.getPositionerProps()}>
      <div {...api.getContentProps()}>
        <button data-testid="primary">Primary</button>
        <button bind:this={secondaryRef} data-testid="secondary">Secondary</button>
        <div {...api.getListProps()}>
          <div {...api.getItemProps({ value: "edit" })}>Edit</div>
          <div {...api.getItemProps({ value: "duplicate" })}>Duplicate</div>
        </div>
      </div>
    </div>
  </Portal>

  <Portal>
    <div {...contextApi.getPositionerProps()}>
      <div data-testid="context-content" {...contextApi.getContentProps()}>
        <div {...contextApi.getListProps()}>
          <div {...contextApi.getItemProps({ value: "rename" })}>Rename</div>
          <div {...contextApi.getItemProps({ value: "delete" })}>Delete</div>
        </div>
      </div>
    </div>
  </Portal>

  <Portal>
    <div {...noFocusApi.getPositionerProps()}>
      <div data-testid="no-focus-content" {...noFocusApi.getContentProps()}>
        <div {...noFocusApi.getListProps()}>
          <div {...noFocusApi.getItemProps({ value: "a" })}>A</div>
          <div {...noFocusApi.getItemProps({ value: "b" })}>B</div>
        </div>
      </div>
    </div>
  </Portal>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
