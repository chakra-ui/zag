import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

interface Resource {
  id: string
  name: string
  description: string
  href: string
}

const resources: Resource[] = [
  { id: "docs", name: "Documentation", description: "Guides and API reference", href: "https://zagjs.com" },
  { id: "github", name: "GitHub", description: "Source code and issues", href: "https://github.com/chakra-ui/zag" },
  { id: "discord", name: "Discord", description: "Community chat", href: "https://chakra-ui.com/discord" },
  { id: "twitter", name: "Twitter", description: "Updates and announcements", href: "https://twitter.com/zag_js" },
]

export default function Page() {
  const [lastNav, setLastNav] = useState<string | null>(null)

  const collection = gridlist.collection<Resource>({
    items: resources,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Resource>, {
    id: useId(),
    collection,
    selectionMode: "none",
    onNavigate({ value, href, preventDefault }) {
      // Intercept navigation so the example doesn't leave the page.
      preventDefault()
      setLastNav(`${value} → ${href}`)
    },
  })

  const api = gridlist.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Resources</label>
            <div {...api.getContentProps()}>
              {resources.map((item) => (
                <div
                  key={item.id}
                  {...api.getItemProps({
                    item,
                    href: item.href,
                    target: "_blank",
                    rel: "noreferrer",
                    focusOnHover: true,
                  })}
                >
                  <div {...api.getCellProps()}>
                    <div className="gridlist-item-body">
                      <span {...api.getItemTextProps({ item })} className="gridlist-item-title">
                        {item.name}
                      </span>
                      <span className="gridlist-item-description">{item.description}</span>
                    </div>
                    <span className="gridlist-item-badge">↗</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Last navigation intercepted: <strong>{lastNav ?? "—"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue"]} />
      </Toolbar>
    </>
  )
}
