import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createUniqueId, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/menu.css"

/**
 * Multiple nested menus. When moving from a trigger to its submenu while passing
 * over other triggers, the owning trigger should stay highlighted (#2955).
 */
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

function useSubmenu(value: string) {
  const service = useMachine(menu.machine, { id: createUniqueId() })
  const api = createMemo(() => menu.connect(service, normalizeProps))
  return { value, service, api }
}

export default function Page() {
  const rootService = useMachine(menu.machine, { id: createUniqueId() })
  const root = createMemo(() => menu.connect(rootService, normalizeProps))

  const submenus = [useSubmenu("platform"), useSubmenu("solutions"), useSubmenu("resources"), useSubmenu("open-source")]

  onMount(() => {
    submenus.forEach(({ service, api }) => {
      root().setChild(service)
      api().setParent(rootService)
    })
  })

  return (
    <main style={{ padding: "40px" }}>
      <p style={{ "margin-bottom": "16px", color: "var(--text-muted)" }}>
        Hover a trigger to open its submenu, then move the pointer into the submenu while passing over other triggers.
        The trigger that owns the open submenu should stay highlighted.
      </p>

      <button data-testid="trigger" {...root().getTriggerProps()}>
        Open menu
      </button>

      <Show when={root().open}>
        <Portal>
          <div {...root().getPositionerProps()}>
            <ul data-testid="root-menu" {...root().getContentProps()}>
              <For each={rootItems}>
                {(item) => {
                  const sub = submenus.find((s) => s.value === item.value)
                  const props = createMemo(() =>
                    item.trigger && sub
                      ? root().getTriggerItemProps(sub.api())
                      : root().getItemProps({ value: item.value }),
                  )
                  return (
                    <li data-testid={item.value} {...props()}>
                      {item.label}
                    </li>
                  )
                }}
              </For>
            </ul>
          </div>
        </Portal>
      </Show>

      <For each={submenus}>
        {({ value, api }) => (
          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <ul data-testid={`submenu-${value}`} {...api().getContentProps()}>
                  <For each={submenuItems[value] ?? []}>
                    {(item) => (
                      <li data-testid={item.value} {...api().getItemProps({ value: item.value })}>
                        {item.label}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Portal>
          </Show>
        )}
      </For>
    </main>
  )
}
