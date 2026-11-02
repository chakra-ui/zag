<script lang="ts">
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import * as navigationMenu from "@zag-js/navigation-menu"
  import { navigationMenuControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronDownIcon } from "lucide-svelte"
  import "@styles/navigation-menu.css"

  const controls = useControls(navigationMenuControls)

  const id = $props.id()
  const service = useMachine(navigationMenu.machine, controls.mergeProps<navigationMenu.Props>({ id }))

  const api = $derived(navigationMenu.connect(service, normalizeProps))
</script>

{#snippet renderLinks(value: string, items: string[])}
  {#each items as item, index (`${value}-${item}-${index}`)}
    <a href="#" {...api.getLinkProps({ value })}>{item}</a>
  {/each}
{/snippet}

<main class="navigation-menu basic">
  <div {...api.getRootProps()}>
    <div {...api.getListProps()}>
      <div {...api.getItemProps({ value: "products" })}>
        <button {...api.getTriggerProps({ value: "products" })}>
          Products
          <ChevronDownIcon />
        </button>
        <Presence {...api.getContentProps({ value: "products" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()}></div>
          </Presence>
          {@render renderLinks("products", [
            "Analytics Platform",
            "Customer Engagement",
            "Marketing Automation",
            "Data Integration",
            "Enterprise Solutions",
            "API Documentation",
          ])}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "company" })}>
        <button {...api.getTriggerProps({ value: "company" })}>
          Company
          <ChevronDownIcon />
        </button>
        <Presence {...api.getContentProps({ value: "company" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()}></div>
          </Presence>
          {@render renderLinks("company", ["About Us", "Leadership Team", "Careers", "Press Releases"])}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "developers" })}>
        <button {...api.getTriggerProps({ value: "developers" })}>
          Developers
          <ChevronDownIcon />
        </button>
        <Presence {...api.getContentProps({ value: "developers" })}>
          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()}></div>
          </Presence>
          {@render renderLinks("developers", ["Investors", "Partners", "Corporate Responsibility"])}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "pricing" })}>
        <a href="#" {...api.getLinkProps({ value: "pricing" })}>Pricing</a>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "previousValue"]} />
</Toolbar>
