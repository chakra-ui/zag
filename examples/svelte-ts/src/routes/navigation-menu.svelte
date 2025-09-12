<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as navigationMenu from "@zag-js/navigation-menu"
  import { navigationMenuControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(navigationMenuControls)

  const id = $props.id()
  const service = useMachine(
    navigationMenu.machine,
    controls.mergeProps<navigationMenu.Props>({
      id,
    }),
  )

  const api = $derived(navigationMenu.connect(service, normalizeProps))

  function renderLinks(opts: { value: string; items: string[] }) {
    const { value, items } = opts
    return items.map((item, index) => ({ item, index, value }))
  }
</script>

<main class="navigation-menu basic">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      <div {...api.getItemProps({ value: "products" })}>
        <button {...api.getTriggerProps({ value: "products" })}>
          Products
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "products" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()} />
          </Presence>
          {#each renderLinks({ value: "products", items: ["Analytics Platform", "Customer Engagement", "Marketing Automation", "Data Integration", "Enterprise Solutions", "API Documentation"] }) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} key={`${value}-${item}-${index}`}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "company" })}>
        <button {...api.getTriggerProps({ value: "company" })}>
          Company
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "company" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()} />
          </Presence>
          {#each renderLinks({ value: "company", items: ["About Us", "Leadership Team", "Careers", "Press Releases"] }) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} key={`${value}-${item}-${index}`}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "developers" })}>
        <button {...api.getTriggerProps({ value: "developers" })}>
          Developers
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "developers" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()} />
          </Presence>
          {#each renderLinks({ value: "developers", items: ["Investors", "Partners", "Corporate Responsibility"] }) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} key={`${value}-${item}-${index}`}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "pricing" })}>
        <a href="#" {...api.getLinkProps({ value: "pricing" })}>
          Pricing
        </a>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "previousValue"]} />
</Toolbar>