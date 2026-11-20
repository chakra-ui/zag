"use client"

import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronDown } from "lucide-react"
import { useId, useState } from "react"
import { Presence } from "@/components/presence"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/navigation-menu.css"

const sections = [
  { value: "guides", label: "Guides", pages: ["Getting started", "Styling", "Accessibility"] },
  { value: "components", label: "Components", pages: ["Accordion", "Dialog", "Menu"] },
]

export default function Page() {
  const [currentPage, setCurrentPage] = useState("Getting started")

  const service = useMachine(navigationMenu.machine, { id: useId() })
  const api = navigationMenu.connect(service, normalizeProps)

  const getPageLinkProps = (value: string, page: string) =>
    api.getLinkProps({ value, current: currentPage === page, onSelect: () => setCurrentPage(page) })

  return (
    <>
      <main>
        <div className="navigation-menu-links">
          <nav {...api.getRootProps()}>
            <div {...api.getListProps()}>
              {sections.map((section) => (
                <div key={section.value} {...api.getItemProps({ value: section.value })}>
                  <button {...api.getTriggerProps({ value: section.value })}>
                    {section.label}
                    <ChevronDown />
                  </button>
                  <Presence {...api.getContentProps({ value: section.value })}>
                    {section.pages.map((page) => (
                      <a
                        key={page}
                        href={`#${page.toLowerCase().replaceAll(" ", "-")}`}
                        {...getPageLinkProps(section.value, page)}
                      >
                        {page}
                      </a>
                    ))}
                  </Presence>
                </div>
              ))}
              <div {...api.getItemProps({ value: "changelog" })}>
                <a href="#changelog" {...getPageLinkProps("changelog", "Changelog")}>
                  Changelog
                </a>
              </div>
            </div>
          </nav>
          <p className="status">
            You're on <strong>{currentPage}</strong>
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "previousValue"]} />
      </Toolbar>
    </>
  )
}
