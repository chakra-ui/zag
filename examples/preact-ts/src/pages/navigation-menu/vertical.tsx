import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { ChevronRight } from "lucide-preact"
import { useId } from "preact/hooks"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/navigation-menu.css"

const sections = [
  { value: "account", label: "Account", links: ["Profile", "Security", "Connected apps"] },
  { value: "billing", label: "Billing", links: ["Invoices", "Payment methods"], disabled: true },
  { value: "notifications", label: "Notifications", links: ["Email", "Push"] },
]

export default function Page() {
  const service = useMachine(navigationMenu.machine, { id: useId(), orientation: "vertical" })
  const api = navigationMenu.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="navigation-menu-vertical">
          <p className="hint">Billing is disabled</p>
          <nav {...api.getRootProps()}>
            <div {...api.getListProps()}>
              {sections.map((section) => (
                <div key={section.value} {...api.getItemProps({ value: section.value, disabled: section.disabled })}>
                  <button {...api.getTriggerProps({ value: section.value, disabled: section.disabled })}>
                    {section.label}
                    <ChevronRight />
                  </button>
                  <Presence {...api.getContentProps({ value: section.value })}>
                    {section.links.map((link) => (
                      <a key={link} href={`#${link}`} {...api.getLinkProps({ value: section.value })}>
                        {link}
                      </a>
                    ))}
                  </Presence>
                </div>
              ))}
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
