<script lang="ts">
  import * as gridlist from "@zag-js/gridlist"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  interface Resource {
    id: string
    name: string
    description: string
    href: string
  }

  const resources: Resource[] = [
    { id: "docs", name: "Documentation", description: "Guides and API reference", href: "https://zagjs.com" },
    { id: "github", name: "GitHub", description: "Source code and issues", href: "https://github.com/chakra-ui/zag" },
    { id: "discord", name: "Discord", description: "Community chat", href: "https://chakra-ui.com/discord" },
    { id: "twitter", name: "Twitter", description: "Updates and announcements", href: "https://twitter.com/zag_js" },
  ]

  const collection = gridlist.collection<Resource>({
    items: resources,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  let lastNav = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(gridlist.machine, {
    id,
    collection,
    selectionMode: "none",
    onNavigate({ value, href, preventDefault }: gridlist.NavigateDetails) {
      preventDefault()
      lastNav = `${value} → ${href}`
    },
  } satisfies gridlist.Props<Resource>)

  const api = $derived(gridlist.connect(service, normalizeProps))
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Resources</label>
      <div {...api.getContentProps()}>
        {#each resources as item}
          <div
            {...api.getItemProps({ item, href: item.href, target: "_blank", rel: "noreferrer", focusOnHover: true })}
          >
            <div {...api.getCellProps()}>
              <div class="gridlist-item-body">
                <span {...api.getItemTextProps({ item })} class="gridlist-item-title">
                  {item.name}
                </span>
                <span class="gridlist-item-description">{item.description}</span>
              </div>
              <span class="gridlist-item-badge">↗</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Last navigation intercepted: <strong>{lastNav ?? "—"}</strong>
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>
