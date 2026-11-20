<script lang="ts">
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as navigationMenu from "@zag-js/navigation-menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronRightIcon } from "lucide-svelte"
  import "@styles/navigation-menu.css"

  const sections = [
    { value: "account", label: "Account", links: ["Profile", "Security", "Connected apps"] },
    { value: "billing", label: "Billing", links: ["Invoices", "Payment methods"], disabled: true },
    { value: "notifications", label: "Notifications", links: ["Email", "Push"] },
  ]

  const id = $props.id()
  const service = useMachine(navigationMenu.machine, { id, orientation: "vertical" })
  const api = $derived(navigationMenu.connect(service, normalizeProps))
</script>

<main>
  <div class="navigation-menu-vertical">
    <p class="hint">Billing is disabled</p>
    <nav {...api.getRootProps()}>
      <div {...api.getListProps()}>
        {#each sections as section (section.value)}
          <div {...api.getItemProps({ value: section.value, disabled: section.disabled })}>
            <button {...api.getTriggerProps({ value: section.value, disabled: section.disabled })}>
              {section.label}
              <ChevronRightIcon />
            </button>
            <Presence {...api.getContentProps({ value: section.value })}>
              {#each section.links as link (link)}
                <a href={`#${link}`} {...api.getLinkProps({ value: section.value })}>{link}</a>
              {/each}
            </Presence>
          </div>
        {/each}
      </div>
    </nav>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "previousValue"]} />
</Toolbar>
