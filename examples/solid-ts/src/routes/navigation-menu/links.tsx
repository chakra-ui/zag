import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronDown } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/navigation-menu.css"

const sections = [
  { value: "guides", label: "Guides", pages: ["Getting started", "Styling", "Accessibility"] },
  { value: "components", label: "Components", pages: ["Accordion", "Dialog", "Menu"] },
]

export default function Page() {
  const [currentPage, setCurrentPage] = createSignal("Getting started")

  const service = useMachine(navigationMenu.machine, { id: createUniqueId() })
  const api = createMemo(() => navigationMenu.connect(service, normalizeProps))

  const getPageLinkProps = (value: string, page: string) =>
    api().getLinkProps({ value, current: currentPage() === page, onSelect: () => setCurrentPage(page) })

  return (
    <>
      <main>
        <div class="navigation-menu-links">
          <nav {...api().getRootProps()}>
            <div {...api().getListProps()}>
              <For each={sections}>
                {(section) => (
                  <div {...api().getItemProps({ value: section.value })}>
                    <button {...api().getTriggerProps({ value: section.value })}>
                      {section.label}
                      <ChevronDown />
                    </button>
                    <Presence {...api().getContentProps({ value: section.value })}>
                      <For each={section.pages}>
                        {(page) => (
                          <a
                            href={`#${page.toLowerCase().replaceAll(" ", "-")}`}
                            {...getPageLinkProps(section.value, page)}
                          >
                            {page}
                          </a>
                        )}
                      </For>
                    </Presence>
                  </div>
                )}
              </For>
              <div {...api().getItemProps({ value: "changelog" })}>
                <a href="#changelog" {...getPageLinkProps("changelog", "Changelog")}>
                  Changelog
                </a>
              </div>
            </div>
          </nav>
          <p class="status">
            You're on <strong>{currentPage()}</strong>
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "previousValue"]} />
      </Toolbar>
    </>
  )
}
