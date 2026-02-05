import { normalizeProps, useMachine } from "@zag-js/react"
import * as navigationMenu from "@zag-js/navigation-menu"
import { useId } from "react"
import { BiChevronDown } from "react-icons/bi"
import { Presence } from "../components/presence"
import styles from "../styles/machines/navigation-menu.module.css"

const solutionLinks = [
  {
    href: "#",
    title: "Zag.js",
    description: "Framework-agnostic UI components.",
  },
  {
    href: "#",
    title: "State Machines",
    description: "The core of our component logic.",
  },
  {
    href: "#",
    title: "Styling",
    description: "How to style your components.",
  },
]

const learnLinks = [
  {
    href: "#",
    title: "Quick Start",
    description: "Assemble your first component.",
  },
  {
    href: "#",
    title: "Accessibility",
    description: "Learn about our accessible design.",
  },
  {
    href: "#",
    title: "About",
    description: "Learn more about our mission.",
  },
]

interface NavigationMenuProps extends Omit<navigationMenu.Props, "id"> {}

export function NavigationMenu(props: NavigationMenuProps) {
  const service = useMachine(navigationMenu.machine, {
    id: useId(),
    ...props,
  })

  const api = navigationMenu.connect(service, normalizeProps)

  return (
    <nav className={styles.Root} {...api.getRootProps()}>
      <div className={styles.List} {...api.getListProps()}>
        <div {...api.getItemProps({ value: "products" })}>
          <button
            className={styles.Trigger}
            {...api.getTriggerProps({ value: "products" })}
          >
            Products
            <BiChevronDown />
          </button>
          <span {...api.getTriggerProxyProps({ value: "products" })} />
          <span {...api.getViewportProxyProps({ value: "products" })} />
        </div>

        <div {...api.getItemProps({ value: "learn" })}>
          <button
            className={styles.Trigger}
            {...api.getTriggerProps({ value: "learn" })}
          >
            Learn
            <BiChevronDown />
          </button>
          <span {...api.getTriggerProxyProps({ value: "learn" })} />
          <span {...api.getViewportProxyProps({ value: "learn" })} />
        </div>

        <div {...api.getItemProps({ value: "github" })}>
          <a
            className={styles.Link}
            {...api.getLinkProps({ value: "github" })}
            href="https://github.com/chakra-ui/zag"
            target="_blank"
          >
            GitHub
          </a>
        </div>

        <Presence
          className={styles.Indicator}
          keepMounted
          {...api.getIndicatorProps()}
        >
          <div className={styles.Arrow} {...api.getArrowProps()} />
        </Presence>
      </div>

      <div
        className={styles.ViewportPositioner}
        {...api.getViewportPositionerProps()}
      >
        <Presence
          className={styles.Viewport}
          keepMounted
          {...api.getViewportProps()}
        >
          <Presence
            className={styles.Content}
            keepMounted
            {...api.getContentProps({ value: "products" })}
          >
            <ul className={styles.GridLinkList}>
              {solutionLinks.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className={styles.LinkCard}
                    {...api.getLinkProps({ value: "products" })}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </Presence>

          <Presence
            className={styles.Content}
            keepMounted
            {...api.getContentProps({ value: "learn" })}
          >
            <ul className={styles.FlexLinkList}>
              {learnLinks.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className={styles.LinkCard}
                    {...api.getLinkProps({ value: "learn" })}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </Presence>
        </Presence>
      </div>
    </nav>
  )
}
