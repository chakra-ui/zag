<script lang="ts">
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as navigationMenu from "@zag-js/navigation-menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ChevronDownIcon } from "lucide-svelte"
  import "@styles/navigation-menu.css"

  const sections = [
    { value: "guides", label: "Guides", pages: ["Getting started", "Styling", "Accessibility"] },
    { value: "components", label: "Components", pages: ["Accordion", "Dialog", "Menu"] },
  ]

  let currentPage = $state("Getting started")

  const id = $props.id()
  const service = useMachine(navigationMenu.machine, { id })
  const api = $derived(navigationMenu.connect(service, normalizeProps))

  const getPageLinkProps = (value: string, page: string) =>
    api.getLinkProps({ value, current: currentPage === page, onSelect: () => (currentPage = page) })
</script>

<main>
  <div class="navigation-menu-links">
    <p class="hint">Pick a page. The menu closes and the link you picked becomes the current page.</p>
    <nav {...api.getRootProps()}>
      <div {...api.getListProps()}>
        {#each sections as section (section.value)}
          <div {...api.getItemProps({ value: section.value })}>
            <button {...api.getTriggerProps({ value: section.value })}>
              {section.label}
              <ChevronDownIcon />
            </button>
            <Presence {...api.getContentProps({ value: section.value })}>
              {#each section.pages as page (page)}
                <a href={`#${page.toLowerCase().replaceAll(" ", "-")}`} {...getPageLinkProps(section.value, page)}
                  >{page}</a
                >
              {/each}
            </Presence>
          </div>
        {/each}
        <div {...api.getItemProps({ value: "changelog" })}>
          <a href="#changelog" {...getPageLinkProps("changelog", "Changelog")}>Changelog</a>
        </div>
      </div>
    </nav>
    <p class="status">
      You're on <strong data-testid="current-page">{currentPage}</strong>
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "previousValue"]} />
</Toolbar>
