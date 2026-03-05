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

<main class="navigation-menu viewport">
  <div class="navbar">
    <button>Logo</button>

    <div {...api.getRootProps()}>
      <div {...api.getListProps()}>
          <div {...api.getItemProps({ value: "products" })}>
            <button {...api.getTriggerProps({ value: "products" })}>
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
            <span {...api.getTriggerProxyProps({ value: "products" })}></span>
            <span {...api.getViewportProxyProps({ value: "products" })}></span>
          </div>

          <div {...api.getItemProps({ value: "company" })}>
            <button {...api.getTriggerProps({ value: "company" })}>
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
            <span {...api.getTriggerProxyProps({ value: "company" })}></span>
            <span {...api.getViewportProxyProps({ value: "company" })}></span>
          </div>

          <div {...api.getItemProps({ value: "developers" })}>
            <button {...api.getTriggerProps({ value: "developers" })}>
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
            <span {...api.getTriggerProxyProps({ value: "developers" })}></span>
            <span {...api.getViewportProxyProps({ value: "developers" })}></span>
          </div>

          <div {...api.getItemProps({ value: "pricing" })}>
            <a href="#" {...api.getLinkProps({ value: "pricing" })}> Pricing </a>
          </div>

          <Presence {...api.getIndicatorProps()}>
            <div {...api.getArrowProps()}></div>
          </Presence>
        </div>

      <div {...api.getViewportPositionerProps()}>
        <Presence {...api.getViewportProps()}>
          <Presence
            {...api.getContentProps({ value: "products" })}
            style="grid-template-columns: 1fr 2fr; width: 600px"
          >
            {#each renderLinks( { value: "products", items: ["Analytics Platform", "Customer Engagement", "Marketing Automation", "Data Integration", "Enterprise Solutions", "API Documentation"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}

            {#each renderLinks( { value: "products", items: ["Case Studies", "Success Stories", "Integration Partners", "Security & Compliance"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}
          </Presence>

          <Presence {...api.getContentProps({ value: "company" })} style="grid-template-columns: 1fr 1fr; width: 450px">
            {#each renderLinks( { value: "company", items: ["About Us", "Leadership Team", "Careers", "Press Releases"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}

            {#each renderLinks( { value: "company", items: ["Investors", "Partners", "Corporate Responsibility"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}
          </Presence>

          <Presence
            {...api.getContentProps({ value: "developers" })}
            style="grid-template-columns: 1.6fr 1fr; width: 650px"
          >
            {#each renderLinks( { value: "developers", items: ["API Documentation", "SDKs & Libraries", "Developer Guides", "Code Samples", "Webhooks", "GraphQL Explorer"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}

            {#each renderLinks( { value: "developers", items: ["Developer Community", "Changelog", "Status Page", "Rate Limits"] }, ) as { item, index, value } (`${value}-${item}-${index}`)}
              <a href="#" {...api.getLinkProps({ value })}>
                {item}
              </a>
            {/each}
          </Presence>
        </Presence>
      </div>
    </div>

    <button>Login</button>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "previousValue", "triggerRect", "viewportSize"]} />
</Toolbar>

<style>
  .navbar {
    position: relative;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    padding: 15px 20px;
    justify-content: space-between;
    width: 100%;
    background-color: white;
    box-shadow:
      0 50px 100px -20px rgba(50, 50, 93, 0.1),
      0 30px 60px -30px rgba(0, 0, 0, 0.2);
  }
</style>
