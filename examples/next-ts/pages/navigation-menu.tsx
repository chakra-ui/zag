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
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            <div {...api.getItemProps({ value: "products" })}>
              <button {...api.getTriggerProps({ value: "products" })}>
                Products
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "products" })}>
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
              </Presence>
            </div>

            <div {...api.getItemProps({ value: "company" })}>
              <button {...api.getTriggerProps({ value: "company" })}>
                Company
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "company" })}>
                {renderLinks({
                  value: "company",
                  items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                })}
              </Presence>
            </div>

            <div {...api.getItemProps({ value: "developers", disabled: true })}>
              <button {...api.getTriggerProps({ value: "developers", disabled: true })}>
                Developers
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "developers" })}>
                {renderLinks({
                  value: "developers",
                  items: ["Donec quis dui", "Vestibulum", "Fusce pellentesque", "Aliquam porttitor"],
                })}
              </Presence>
            </div>

            <div {...api.getItemProps({ value: "pricing" })}>
              <a href="#" {...api.getLinkProps({ value: "pricing" })}>
                Pricing
              </a>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
