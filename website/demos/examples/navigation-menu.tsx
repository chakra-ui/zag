import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "../../components/docs/presence"
import styles from "../../styles/machines/navigation-menu.module.css"
import { Ghost, Log, Row, Stack, show } from "./shared"

const menus = [
  {
    value: "products",
    label: "Products",
    grid: true,
    links: [
      { title: "Analytics", description: "Measure what matters." },
      { title: "Automation", description: "Workflows that run themselves." },
      { title: "Reports", description: "Share results with your team." },
      { title: "Integrations", description: "Connect the tools you use." },
    ],
  },
  {
    value: "learn",
    label: "Learn",
    grid: false,
    links: [
      { title: "Quick start", description: "Ship your first flow." },
      { title: "Guides", description: "Step by step recipes." },
      { title: "Changelog", description: "What shipped this month." },
    ],
  },
]

function useNav(props: Partial<navigationMenu.Props> = {}) {
  const service = useMachine(navigationMenu.machine, { id: useId(), ...props })
  return navigationMenu.connect(service, normalizeProps)
}

const preventNavigation = (event: CustomEvent) => {
  event.detail?.originalEvent?.preventDefault()
}

interface ViewProps {
  api: navigationMenu.Api
  indicator?: boolean
  disabled?: string
  current?: string
  closeOnClick?: boolean
  align?: "start" | "center" | "end"
  onLinkSelect?: (title: string) => void
}

function View(props: ViewProps) {
  const { api } = props

  const linkProps = (value: string, title: string) =>
    api.getLinkProps({
      value,
      current: props.current === title,
      closeOnClick: props.closeOnClick,
      onSelect(event) {
        preventNavigation(event)
        props.onLinkSelect?.(title)
      },
    })

  return (
    <div className={styles.Example} data-orientation={api.orientation}>
      <nav className={styles.Root} {...api.getRootProps()}>
        <div className={styles.List} {...api.getListProps()}>
          {menus.map((menu) => {
            const disabled = props.disabled === menu.value
            return (
              <div
                key={menu.value}
                {...api.getItemProps({ value: menu.value, disabled })}
              >
                <button
                  className={styles.Trigger}
                  {...api.getTriggerProps({ value: menu.value, disabled })}
                >
                  {menu.label}
                  <span className={styles.Chevron} aria-hidden>
                    ▾
                  </span>
                </button>
                <span {...api.getTriggerProxyProps({ value: menu.value })} />
                <span {...api.getViewportProxyProps({ value: menu.value })} />
              </div>
            )
          })}
          <div {...api.getItemProps({ value: "pricing" })}>
            <a
              href="#pricing"
              className={styles.Link}
              {...linkProps("pricing", "Pricing")}
            >
              Pricing
            </a>
          </div>
          {props.indicator && (
            <Presence
              className={styles.Indicator}
              keepMounted
              {...api.getIndicatorProps()}
            >
              <div className={styles.Arrow} {...api.getArrowProps()} />
            </Presence>
          )}
        </div>

        <div
          className={styles.ViewportPositioner}
          {...api.getViewportPositionerProps({ align: props.align })}
        >
          <Presence
            className={styles.Viewport}
            keepMounted
            {...api.getViewportProps({ align: props.align })}
          >
            {menus.map((menu) => (
              <Presence
                key={menu.value}
                className={styles.Content}
                keepMounted
                {...api.getContentProps({ value: menu.value })}
              >
                <ul
                  className={
                    menu.grid ? styles.GridLinkList : styles.FlexLinkList
                  }
                >
                  {menu.links.map((link) => (
                    <li key={link.title}>
                      <a
                        href={`#${link.title.toLowerCase().replace(" ", "-")}`}
                        className={styles.LinkCard}
                        {...linkProps(menu.value, link.title)}
                      >
                        <h3>{link.title}</h3>
                        <p>{link.description}</p>
                      </a>
                    </li>
                  ))}
                </ul>
              </Presence>
            ))}
          </Presence>
        </div>
      </nav>
    </div>
  )
}

export function NavigationMenuViewport() {
  const api = useNav()
  return <View api={api} indicator />
}

export function NavigationMenuControlled() {
  const [value, setValue] = useState("")
  const api = useNav({
    value,
    onValueChange: (details) => setValue(details.value),
  })
  return (
    <Stack>
      <Row>
        <Ghost onClick={() => setValue("products")}>Open Products</Ghost>
        <Ghost onClick={() => setValue("")}>Close all</Ghost>
      </Row>
      <View api={api} />
    </Stack>
  )
}

export function NavigationMenuDefaultValue() {
  const api = useNav({ defaultValue: "products" })
  return <View api={api} />
}

export function NavigationMenuValueChange() {
  const [value, setValue] = useState("")
  const api = useNav({ onValueChange: (details) => setValue(details.value) })
  return (
    <Stack>
      <Log label="onValueChange" value={show(value)} />
      <View api={api} />
    </Stack>
  )
}

export function NavigationMenuIndicator() {
  const api = useNav()
  return <View api={api} indicator />
}

export function NavigationMenuDelays() {
  const api = useNav({ openDelay: 600, closeDelay: 800 })
  return (
    <Stack>
      <Log label="openDelay 600 · closeDelay" value="800" />
      <View api={api} />
    </Stack>
  )
}

export function NavigationMenuClickOnly() {
  const api = useNav({ disableHoverTrigger: true })
  return (
    <Stack>
      <Log label="disableHoverTrigger" value="click to open" />
      <View api={api} />
    </Stack>
  )
}

export function NavigationMenuVertical() {
  const api = useNav({ orientation: "vertical" })
  return <View api={api} indicator />
}

export function NavigationMenuDisabled() {
  const api = useNav()
  return <View api={api} disabled="learn" />
}

export function NavigationMenuCurrent() {
  const api = useNav()
  return <View api={api} current="Pricing" />
}

export function NavigationMenuKeepOpen() {
  const [link, setLink] = useState("—")
  const api = useNav()
  return (
    <Stack>
      <Log label="clicked" value={link} />
      <View api={api} closeOnClick={false} onLinkSelect={setLink} />
    </Stack>
  )
}

export function NavigationMenuAlign() {
  const api = useNav()
  return <View api={api} align="start" />
}

export function NavigationMenuRtl() {
  const api = useNav({ dir: "rtl" })
  return (
    <div dir="rtl">
      <View api={api} indicator />
    </div>
  )
}
