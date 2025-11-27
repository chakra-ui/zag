import { normalizeProps, useMachine } from "@zag-js/react"
import * as navigationMenu from "@zag-js/navigation-menu"
import { useId } from "react"
import { BiChevronDown } from "react-icons/bi"

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
    <nav className="navigation-menu" {...api.getRootProps()}>
      <div {...api.getListProps()}>
        <div {...api.getItemProps({ value: "solutions" })}>
          <button {...api.getTriggerProps({ value: "solutions" })}>
            Solutions
            <BiChevronDown />
          </button>
          <span {...api.getTriggerProxyProps({ value: "solutions" })} />
          <span {...api.getViewportProxyProps({ value: "solutions" })} />
        </div>

        <div {...api.getItemProps({ value: "learn" })}>
          <button {...api.getTriggerProps({ value: "learn" })}>
            Learn
            <BiChevronDown />
          </button>
          <span {...api.getTriggerProxyProps({ value: "learn" })} />
          <span {...api.getViewportProxyProps({ value: "learn" })} />
        </div>

        <div {...api.getItemProps({ value: "github" })}>
          <a href="https://github.com/chakra-ui/zag" target="_blank">
            GitHub
          </a>
        </div>

        <div {...api.getIndicatorProps()}>
          <div {...api.getArrowProps()} />
        </div>
      </div>

      <div {...api.getViewportPositionerProps()}>
        <div {...api.getViewportProps()}>
          <div {...api.getContentProps({ value: "solutions" })}>
            <ul className="grid-link-list">
              {solutionLinks.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className="link-card"
                    {...api.getLinkProps({ value: "solutions" })}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div {...api.getContentProps({ value: "learn" })}>
            <ul className="flex-link-list">
              {learnLinks.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className="link-card"
                    {...api.getLinkProps({ value: "learn" })}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  )
}
