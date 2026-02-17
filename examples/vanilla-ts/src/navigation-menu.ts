import * as navigationMenu from "@zag-js/navigation-menu"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

interface MenuItem {
  value: string
  label: string
  links?: string[]
}

const menuItems: MenuItem[] = [
  {
    value: "products",
    label: "Products",
    links: [
      "Analytics Platform",
      "Customer Engagement",
      "Marketing Automation",
      "Data Integration",
      "Enterprise Solutions",
      "API Documentation",
    ],
  },
  {
    value: "company",
    label: "Company",
    links: ["About Us", "Leadership Team", "Careers", "Press Releases"],
  },
  {
    value: "developers",
    label: "Developers",
    links: ["Investors", "Partners", "Corporate Responsibility"],
  },
  {
    value: "pricing",
    label: "Pricing",
  },
]

export class NavigationMenu extends Component<navigationMenu.Props, navigationMenu.Api> {
  initMachine(props: navigationMenu.Props) {
    return new VanillaMachine(navigationMenu.machine, {
      ...props,
    })
  }

  initApi() {
    return navigationMenu.connect(this.machine.service, normalizeProps)
  }

  private createChevronIcon(): SVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "12")
    svg.setAttribute("height", "12")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "currentColor")
    svg.setAttribute("stroke-width", "2")
    svg.innerHTML = `<path d="M6 9l6 6 6-6"/>`
    return svg
  }

  private syncMenuItems = () => {
    const list = this.rootEl.querySelector<HTMLElement>("[data-part='list']")
    if (!list) return

    // Clear and rebuild (simpler for this component)
    list.innerHTML = ""

    menuItems.forEach((menuItem) => {
      const itemEl = this.doc.createElement("div")
      this.spreadProps(itemEl, this.api.getItemProps({ value: menuItem.value }))

      if (menuItem.links) {
        // Dropdown item
        const trigger = this.doc.createElement("button")
        trigger.textContent = menuItem.label
        trigger.appendChild(this.createChevronIcon())
        this.spreadProps(trigger, this.api.getTriggerProps({ value: menuItem.value }))
        itemEl.appendChild(trigger)

        const content = this.doc.createElement("div")
        this.spreadProps(content, this.api.getContentProps({ value: menuItem.value }))

        const indicator = this.doc.createElement("div")
        this.spreadProps(indicator, this.api.getIndicatorProps())

        const arrow = this.doc.createElement("div")
        this.spreadProps(arrow, this.api.getArrowProps())
        indicator.appendChild(arrow)
        content.appendChild(indicator)

        menuItem.links.forEach((linkText) => {
          const link = this.doc.createElement("a") as HTMLAnchorElement
          link.href = "#"
          link.textContent = linkText
          this.spreadProps(link, this.api.getLinkProps({ value: menuItem.value }))
          content.appendChild(link)
        })

        itemEl.appendChild(content)
      } else {
        // Simple link item
        const link = this.doc.createElement("a") as HTMLAnchorElement
        link.href = "#"
        link.textContent = menuItem.label
        this.spreadProps(link, this.api.getLinkProps({ value: menuItem.value }))
        itemEl.appendChild(link)
      }

      list.appendChild(itemEl)
    })
  }

  render() {
    this.spreadProps(this.rootEl, this.api.getRootProps())

    const list = this.rootEl.querySelector<HTMLElement>("[data-part='list']")
    if (list) this.spreadProps(list, this.api.getListProps())

    this.syncMenuItems()
  }
}
