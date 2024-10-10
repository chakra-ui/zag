import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronDown } from "lucide-react"
import { useId } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(navigationMenu.machine({ id: useId() }))

  const api = navigationMenu.connect(state, send, normalizeProps)

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
      <main className="navigation-menu">
        <Navbar>
          <div {...api.getRootProps()}>
            <div style={{ position: "relative" }}>
              <div {...api.getListProps()}>
                <div {...api.getItemProps({ value: "products" })}>
                  <button {...api.getTriggerProps({ value: "products" })}>
                    Products
                    <ChevronDown />
                  </button>
                </div>

                <div {...api.getItemProps({ value: "company" })}>
                  <button {...api.getTriggerProps({ value: "company" })}>
                    Company
                    <ChevronDown />
                  </button>
                </div>

                <div {...api.getItemProps({ value: "developers", disabled: true })}>
                  <button {...api.getTriggerProps({ value: "developers", disabled: true })}>
                    Developers
                    <ChevronDown />
                  </button>
                </div>

                <div {...api.getItemProps({ value: "pricing" })}>
                  <a href="#" {...api.getLinkProps({ value: "pricing" })}>
                    Pricing
                  </a>
                </div>

                <Presence {...api.getArrowProps()}>
                  <div {...api.getArrowTipProps()} />
                </Presence>
              </div>
            </div>

            <div data-scope="navigation-menu" data-part="viewport-container">
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
                      "Fusce pellentesque",
                      "Aliquam porttitor",
                      "Pellentesque",
                      "Fusce pellentesque",
                      "Aliquam porttitor",
                      "Pellentesque",
                    ],
                  })}

                  {renderLinks({
                    value: "products",
                    items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
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
                    items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque", "Aliquam porttitor"],
                  })}

                  {renderLinks({
                    value: "company",
                    items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
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
                    items: ["Donec quis dui", "Vestibulum", "Fusce pellentesque", "Aliquam porttitor"],
                  })}
                  {renderLinks({
                    value: "developers",
                    items: ["Fusce pellentesque", "Aliquam porttitor"],
                  })}
                </Presence>
              </Presence>
            </div>
          </div>
        </Navbar>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

const Navbar = ({ children }: { children: React.ReactNode }) => {
  return (
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
      {children}
      <button>Login</button>
    </div>
  )
}
