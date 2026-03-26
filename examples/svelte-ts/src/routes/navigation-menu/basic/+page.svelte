<script lang="ts">
  import styles from "../../../../../../shared/src/css/navigation-menu.module.css"
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
  <div {...api.getRootProps()} class={styles.Root}>
    <div {...api.getListProps()} class={styles.List}>
      <div {...api.getItemProps({ value: "products" })} class={styles.Item}>
        <button {...api.getTriggerProps({ value: "products" })} class={styles.Trigger}>
          Products
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "products" })} class={styles.Content}>
          <Presence {...api.getIndicatorProps()} class={styles.Indicator}>
            <div {...api.getArrowProps()} class={styles.Arrow}></div>
          </Presence>
          {#each renderLinks( { value: "products", items: ["Analytics Platform", "Customer Engagement", "Marketing Automation", "Data Integration", "Enterprise Solutions", "API Documentation"] }, ) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} class={styles.Link}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "company" })} class={styles.Item}>
        <button {...api.getTriggerProps({ value: "company" })} class={styles.Trigger}>
          Company
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "company" })} class={styles.Content}>
          <Presence {...api.getIndicatorProps()} class={styles.Indicator}>
            <div {...api.getArrowProps()} class={styles.Arrow}></div>
          </Presence>
          {#each renderLinks( { value: "company", items: ["About Us", "Leadership Team", "Careers", "Press Releases"] }, ) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} class={styles.Link}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "developers" })} class={styles.Item}>
        <button {...api.getTriggerProps({ value: "developers" })} class={styles.Trigger}>
          Developers
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>
        <Presence {...api.getContentProps({ value: "developers" })} class={styles.Content}>
          <Presence {...api.getIndicatorProps()} class={styles.Indicator}>
            <div {...api.getArrowProps()} class={styles.Arrow}></div>
          </Presence>
          {#each renderLinks( { value: "developers", items: ["Investors", "Partners", "Corporate Responsibility"] }, ) as { item, index, value }}
            <a href="#" {...api.getLinkProps({ value })} class={styles.Link}>
              {item}
            </a>
          {/each}
        </Presence>
      </div>

      <div {...api.getItemProps({ value: "pricing" })} class={styles.Item}>
        <a href="#" {...api.getLinkProps({ value: "pricing" })} class={styles.Link}> Pricing </a>
      </div>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "previousValue"]} />
</Toolbar>
