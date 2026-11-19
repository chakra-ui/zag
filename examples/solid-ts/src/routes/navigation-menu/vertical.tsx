import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronRight } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/navigation-menu.css"

const sections = [
  { value: "account", label: "Account", links: ["Profile", "Security", "Connected apps"] },
  { value: "billing", label: "Billing", links: ["Invoices", "Payment methods"], disabled: true },
  { value: "notifications", label: "Notifications", links: ["Email", "Push"] },
]

export default function Page() {
  const service = useMachine(navigationMenu.machine, { id: createUniqueId(), orientation: "vertical" })
  const api = createMemo(() => navigationMenu.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="navigation-menu-vertical">
          <p class="hint">Use the arrow keys to move between sections. Billing is admin-only, so it's skipped.</p>
          <nav {...api().getRootProps()}>
            <div {...api().getListProps()}>
              <For each={sections}>
                {(section) => (
                  <div {...api().getItemProps({ value: section.value, disabled: section.disabled })}>
                    <button {...api().getTriggerProps({ value: section.value, disabled: section.disabled })}>
                      {section.label}
                      <ChevronRight />
                    </button>
                    <Presence {...api().getContentProps({ value: section.value })}>
                      <For each={section.links}>
                        {(link) => (
                          <a href={`#${link}`} {...api().getLinkProps({ value: section.value })}>
                            {link}
                          </a>
                        )}
                      </For>
                    </Presence>
                  </div>
                )}
              </For>
            </div>
          </nav>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "previousValue"]} />
      </Toolbar>
    </>
  )
}
