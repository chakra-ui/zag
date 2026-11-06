<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as hoverCard from "@zag-js/hover-card"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/hover-card.css"
  import "@styles/menu.css"

  const id = $props.id()
  const parentService = useMachine(hoverCard.machine, { id: `${id}-parent` })
  const childService = useMachine(hoverCard.machine, { id: `${id}-child`, positioning: { placement: "right" } })
  const menuService = useMachine(menu.machine, { id: `${id}-menu` })

  const parent = $derived(hoverCard.connect(parentService, normalizeProps))
  const child = $derived(hoverCard.connect(childService, normalizeProps))
  const actions = $derived(menu.connect(menuService, normalizeProps))
</script>

<main class="hover-card">
  <a href="#" data-testid="parent-trigger" {...parent.getTriggerProps()}>Zag.js</a>

  {#if parent.open}
    <Portal>
      <div {...parent.getPositionerProps()}>
        <div data-testid="parent-content" {...parent.getContentProps()}>
          <p>UI components powered by state machines.</p>
          <div style="display: flex; gap: 16px; align-items: center">
            <a href="#" data-testid="child-trigger" {...child.getTriggerProps()}>@segunadebayo</a>
            <button data-testid="menu-trigger" {...actions.getTriggerProps()}>Actions</button>
          </div>
        </div>
      </div>
    </Portal>
  {/if}

  {#if child.open}
    <Portal>
      <div {...child.getPositionerProps()}>
        <div data-testid="child-content" {...child.getContentProps()}>Segun Adebayo, creator of Zag.js</div>
      </div>
    </Portal>
  {/if}

  {#if actions.open}
    <Portal>
      <div {...actions.getPositionerProps()}>
        <ul data-testid="menu-content" {...actions.getContentProps()}>
          <li {...actions.getItemProps({ value: "follow" })}>Follow</li>
          <li {...actions.getItemProps({ value: "share" })}>Share</li>
        </ul>
      </div>
    </Portal>
  {/if}
</main>
