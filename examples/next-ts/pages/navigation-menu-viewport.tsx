import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { navigationMenuControls } from "@zag-js/shared"
import { ChevronDown } from "lucide-react"
import { useId } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(navigationMenuControls)

  const service = useMachine(navigationMenu.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = navigationMenu.connect(service, normalizeProps)

  const renderLinks = (opts: { value: string; items: string[] }) => {
    const { value, items } = opts
    return items.map((item, index) => (
      <a href="#" key={`${value}-${item}-${index}`} {...api.getLinkProps({ value })}>
        {item}
      </a>
    ))
  }

  return (
    <>
      <main className="navigation-menu viewport">
        <div
          style={{
            position: "relative",
            display: "flex",
            boxSizing: "border-box",
            alignItems: "center",
            padding: "15px 20px",
            justifyContent: "space-between",
            width: "100%",
            backgroundColor: "white",
            boxShadow: "0 50px 100px -20px rgba(50,50,93,0.1),0 30px 60px -30px rgba(0,0,0,0.2)",
          }}
        >
          <button>Logo</button>
          <div {...api.getRootProps()}>
            <div {...api.getIndicatorTrackProps()}>
              <div {...api.getListProps()}>
                <div {...api.getItemProps({ value: "products" })}>
                  <button {...api.getTriggerProps({ value: "products" })}>
                    Products
                    <ChevronDown />
                  </button>
                  <span {...api.getTriggerProxyProps({ value: "products" })} />
                  <span {...api.getViewportProxyProps({ value: "products" })} />
                </div>

                <div {...api.getItemProps({ value: "company" })}>
                  <button {...api.getTriggerProps({ value: "company" })}>
                    Company
                    <ChevronDown />
                  </button>
                  <span {...api.getTriggerProxyProps({ value: "company" })} />
                  <span {...api.getViewportProxyProps({ value: "company" })} />
                </div>

                <div {...api.getItemProps({ value: "developers" })}>
                  <button {...api.getTriggerProps({ value: "developers" })}>
                    Developers
                    <ChevronDown />
                  </button>
                  <span {...api.getTriggerProxyProps({ value: "developers" })} />
                  <span {...api.getViewportProxyProps({ value: "developers" })} />
                </div>

                <div {...api.getItemProps({ value: "pricing" })}>
                  <a href="#" {...api.getLinkProps({ value: "pricing" })}>
                    Pricing
                  </a>
                </div>

                <Presence {...api.getIndicatorProps()}>
                  <div {...api.getArrowProps()} />
                </Presence>
              </div>
            </div>

            <div {...api.getViewportPositionerProps()}>
              <Presence {...api.getViewportProps()}>
                <Presence
                  {...api.getContentProps({ value: "products" })}
                  style={{
                    gridTemplateColumns: "1fr 2fr",
                    width: 600,
                  }}
                >
                  {renderLinks({
                    value: "products",
                    items: [
                      "Analytics Platform",
                      "Customer Engagement",
                      "Marketing Automation",
                      "Data Integration",
                      "Enterprise Solutions",
                      "API Documentation",
                    ],
                  })}

                  {renderLinks({
                    value: "products",
                    items: ["Case Studies", "Success Stories", "Integration Partners", "Security & Compliance"],
                  })}
                </Presence>

                <Presence
                  {...api.getContentProps({ value: "company" })}
                  style={{
                    gridTemplateColumns: "1fr 1fr",
                    width: 450,
                  }}
                >
                  {renderLinks({
                    value: "company",
                    items: ["About Us", "Leadership Team", "Careers", "Press Releases"],
                  })}

                  {renderLinks({
                    value: "company",
                    items: ["Investors", "Partners", "Corporate Responsibility"],
                  })}
                </Presence>

                <Presence
                  {...api.getContentProps({ value: "developers" })}
                  style={{
                    gridTemplateColumns: "1.6fr 1fr",
                    width: 650,
                  }}
                >
                  {renderLinks({
                    value: "developers",
                    items: [
                      "API Documentation",
                      "SDKs & Libraries",
                      "Developer Guides",
                      "Code Samples",
                      "Webhooks",
                      "GraphQL Explorer",
                    ],
                  })}
                  {renderLinks({
                    value: "developers",
                    items: ["Developer Community", "Changelog", "Status Page", "Rate Limits"],
                  })}
                </Presence>
              </Presence>
            </div>
          </div>
          <button>Login</button>
        </div>

        <header>
          <h1>Heading</h1>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
          <div>
            <button>Get Started</button>
            <a href="#">Learn More</a>
          </div>
        </header>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} context={["value", "previousValue", "triggerRect", "viewportSize"]} />
      </Toolbar>
    </>
  )
}
