import styles from "../../../../shared/src/css/menu.module.css"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { useEffectOnce } from "../../hooks/use-effect-once"

/**
 * Multiple nested menus – similar to GitHub/Ark nav.
 * Root has several trigger items; hovering one opens its submenu.
 * Reproduces: when moving from a trigger to its submenu while passing over
 * other triggers, the correct trigger should stay highlighted (issue #2955).
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

export default function Page() {
  const rootService = useMachine(menu.machine, { id: useId() })
  const root = menu.connect(rootService, normalizeProps)

  const platformService = useMachine(menu.machine, { id: useId() })
  const platform = menu.connect(platformService, normalizeProps)

  const solutionsService = useMachine(menu.machine, { id: useId() })
  const solutions = menu.connect(solutionsService, normalizeProps)

  const resourcesService = useMachine(menu.machine, { id: useId() })
  const resources = menu.connect(resourcesService, normalizeProps)

  const openSourceService = useMachine(menu.machine, { id: useId() })
  const openSource = menu.connect(openSourceService, normalizeProps)

  const submenus = [
    { value: "platform", service: platformService, api: platform },
    { value: "solutions", service: solutionsService, api: solutions },
    { value: "resources", service: resourcesService, api: resources },
    { value: "open-source", service: openSourceService, api: openSource },
  ]

  useEffectOnce(() => {
    submenus.forEach(({ service, api }) => {
      root.setChild(service)
      api.setParent(rootService)
    })
  })

  return (
    <main style={{ padding: "40px" }}>
      <p style={{ marginBottom: 16, color: "var(--text-muted)" }}>
        Hover a trigger to open its submenu, then move the pointer into the submenu while passing over other triggers.
        The trigger that owns the open submenu should stay highlighted.
      </p>

      <button data-testid="trigger" {...root.getTriggerProps()}>
        Open menu
      </button>

      {root.open && (
        <Portal>
          <div {...root.getPositionerProps()}>
            <ul data-testid="root-menu" {...root.getContentProps()}>
              {rootItems.map((item) => {
                const sub = submenus.find((s) => s.value === item.value)
                const props =
                  item.trigger && sub ? root.getTriggerItemProps(sub.api) : root.getItemProps({ value: item.value })
                return (
                  <li key={item.value} data-testid={item.value} {...props}>
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Portal>
      )}

      {submenus.map(({ value, api }) =>
        api.open ? (
          <Portal key={value}>
            <div {...api.getPositionerProps()}>
              <ul data-testid={`submenu-${value}`} {...api.getContentProps()} className={styles.Content}>
                {(submenuItems[value] ?? []).map((item) => (
                  <li key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })} className={styles.Item}>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
        ) : null,
      )}
    </main>
  )
}
