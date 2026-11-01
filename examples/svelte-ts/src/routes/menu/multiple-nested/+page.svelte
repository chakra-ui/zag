<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { onMount } from "svelte"
  import "@styles/menu.css"

  // Moving from a trigger into its submenu across other triggers must keep the owning trigger highlighted
  const rootItems = [
    { label: "Platform →", value: "platform", trigger: true },
    { label: "Solutions →", value: "solutions", trigger: true },
    { label: "Resources →", value: "resources", trigger: true },
    { label: "Open Source →", value: "open-source", trigger: true },
  ]

  const platformItems = [
    { label: "GitHub Copilot", value: "copilot" },
    { label: "GitHub Spark", value: "spark" },
    { label: "GitHub Models", value: "models" },
    { label: "MCP Registry", value: "mcp" },
  ]

  const solutionsItems = [
    { label: "Enterprises", value: "enterprises" },
    { label: "Small and medium teams", value: "teams" },
    { label: "Startups", value: "startups" },
  ]

  const resourcesItems = [
    { label: "Documentation", value: "docs" },
    { label: "Blog", value: "blog" },
    { label: "Changelog", value: "changelog" },
  ]

  const openSourceItems = [
    { label: "GitHub Sponsors", value: "sponsors" },
    { label: "Security Lab", value: "security-lab" },
    { label: "Trending", value: "trending" },
  ]

  const submenuItems: Record<string, typeof platformItems> = {
    platform: platformItems,
    solutions: solutionsItems,
    resources: resourcesItems,
    "open-source": openSourceItems,
  }

  const id = $props.id()

  const rootService = useMachine(menu.machine, { id })
  const root = $derived(menu.connect(rootService, normalizeProps))

  const platformService = useMachine(menu.machine, { id: `${id}-platform` })
  const platform = $derived(menu.connect(platformService, normalizeProps))

  const solutionsService = useMachine(menu.machine, { id: `${id}-solutions` })
  const solutions = $derived(menu.connect(solutionsService, normalizeProps))

  const resourcesService = useMachine(menu.machine, { id: `${id}-resources` })
  const resources = $derived(menu.connect(resourcesService, normalizeProps))

  const openSourceService = useMachine(menu.machine, { id: `${id}-open-source` })
  const openSource = $derived(menu.connect(openSourceService, normalizeProps))

  const submenus = $derived([
    { value: "platform", service: platformService, api: platform },
    { value: "solutions", service: solutionsService, api: solutions },
    { value: "resources", service: resourcesService, api: resources },
    { value: "open-source", service: openSourceService, api: openSource },
  ])

  onMount(() => {
    submenus.forEach(({ service, api }) => {
      root.setChild(service)
      api.setParent(rootService)
    })
  })
</script>

<main style="padding: 40px">
  <p style="margin-bottom: 16px; color: var(--text-muted)">
    Hover a trigger to open its submenu, then move the pointer into the submenu while passing over other triggers. The
    trigger that owns the open submenu should stay highlighted.
  </p>

  <button data-testid="trigger" {...root.getTriggerProps()}>Open menu</button>

  {#if root.open}
    <Portal>
      <div {...root.getPositionerProps()}>
        <ul data-testid="root-menu" {...root.getContentProps()}>
          {#each rootItems as item (item.value)}
            {@const sub = submenus.find((s) => s.value === item.value)}
            {@const props =
              item.trigger && sub ? root.getTriggerItemProps(sub.api) : root.getItemProps({ value: item.value })}
            <li data-testid={item.value} {...props}>
              {item.label}
            </li>
          {/each}
        </ul>
      </div>
    </Portal>
  {/if}

  {#each submenus as { value, api } (value)}
    {#if api.open}
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul data-testid={`submenu-${value}`} {...api.getContentProps()}>
            {#each submenuItems[value] ?? [] as item (item.value)}
              <li data-testid={item.value} {...api.getItemProps({ value: item.value })}>
                {item.label}
              </li>
            {/each}
          </ul>
        </div>
      </Portal>
    {/if}
  {/each}
</main>
