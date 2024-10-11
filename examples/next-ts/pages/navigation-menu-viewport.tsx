import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronDown } from "lucide-react"
import { useId } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { navigationMenuControls } from "@zag-js/shared"

export default function Page() {
  const controls = useControls(navigationMenuControls)

  const [state, send] = useMachine(navigationMenu.machine({ id: useId() }), {
    context: controls.context,
  })

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
            <div {...api.getIndicatorTrackProps()}>
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

      <Toolbar controls={controls.ui} viz>
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
