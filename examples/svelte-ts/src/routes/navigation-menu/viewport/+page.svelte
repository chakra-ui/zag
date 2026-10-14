<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as navigationMenu from "@zag-js/navigation-menu"
  import { navigationMenuControls } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronDownIcon } from "lucide-svelte"
  import "@styles/navigation-menu.css"
  import "@styles/navigation-menu-viewport.css"

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

<main class="navigation-menu viewport">
  <div
    style="position: relative; display: flex; box-sizing: border-box; align-items: center; padding: 15px 20px; justify-content: space-between; width: 100%; background-color: white; box-shadow: 0 50px 100px -20px rgba(50,50,93,0.1),0 30px 60px -30px rgba(0,0,0,0.2)"
  >
    <button>Logo</button>
    <div {...api.getRootProps()}>
      <div {...api.getListProps()}>
        <div {...api.getItemProps({ value: "products" })}>
          <button {...api.getTriggerProps({ value: "products" })}>
            Products
            <ChevronDownIcon />
          </button>
          <span {...api.getTriggerProxyProps({ value: "products" })}></span>
          <span {...api.getViewportProxyProps({ value: "products" })}></span>
        </div>

        <div {...api.getItemProps({ value: "company" })}>
          <button {...api.getTriggerProps({ value: "company" })}>
            Company
            <ChevronDownIcon />
          </button>
          <span {...api.getTriggerProxyProps({ value: "company" })}></span>
          <span {...api.getViewportProxyProps({ value: "company" })}></span>
        </div>

        <div {...api.getItemProps({ value: "developers" })}>
          <button {...api.getTriggerProps({ value: "developers" })}>
            Developers
            <ChevronDownIcon />
          </button>
          <span {...api.getTriggerProxyProps({ value: "developers" })}></span>
          <span {...api.getViewportProxyProps({ value: "developers" })}></span>
        </div>

        <div {...api.getItemProps({ value: "pricing" })}>
          <a href="#" {...api.getLinkProps({ value: "pricing" })}>Pricing</a>
        </div>

        <Presence {...api.getIndicatorProps()}>
          <div {...api.getArrowProps()}></div>
        </Presence>
      </div>

      <div {...api.getViewportPositionerProps()}>
        <Presence {...api.getViewportProps()}>
          <Presence
            {...mergeProps(api.getContentProps({ value: "products" }), {
              style: { gridTemplateColumns: "1fr 2fr", width: "600px" },
            })}
          >
            {@render renderLinks("products", [
              "Analytics Platform",
              "Customer Engagement",
              "Marketing Automation",
              "Data Integration",
              "Enterprise Solutions",
              "API Documentation",
            ])}

            {@render renderLinks("products", [
              "Case Studies",
              "Success Stories",
              "Integration Partners",
              "Security & Compliance",
            ])}
          </Presence>

          <Presence
            {...mergeProps(api.getContentProps({ value: "company" }), {
              style: { gridTemplateColumns: "1fr 1fr", width: "450px" },
            })}
          >
            {@render renderLinks("company", ["About Us", "Leadership Team", "Careers", "Press Releases"])}

            {@render renderLinks("company", ["Investors", "Partners", "Corporate Responsibility"])}
          </Presence>

          <Presence
            {...mergeProps(api.getContentProps({ value: "developers" }), {
              style: { gridTemplateColumns: "1.6fr 1fr", width: "650px" },
            })}
          >
            {@render renderLinks("developers", [
              "API Documentation",
              "SDKs & Libraries",
              "Developer Guides",
              "Code Samples",
              "Webhooks",
              "GraphQL Explorer",
            ])}
            {@render renderLinks("developers", ["Developer Community", "Changelog", "Status Page", "Rate Limits"])}
          </Presence>
        </Presence>
      </div>
    </div>
    <button>Login</button>
  </div>

  <header>
    <h1>Heading</h1>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
    <div>
      <button>Get Started</button>
      <a href="#">Learn More</a>
    </div>
  </header>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "previousValue", "triggerRect", "viewportSize"]} />
</Toolbar>
