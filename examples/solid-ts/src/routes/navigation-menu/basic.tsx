import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { navigationMenuControls } from "@zag-js/shared"
import { ChevronDown } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

export default function Page() {
  const controls = useControls(navigationMenuControls)

  const service = useMachine(
    navigationMenu.machine,
    controls.mergeProps<navigationMenu.Props>({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => navigationMenu.connect(service, normalizeProps))

  const renderLinks = (opts: { value: string; items: string[] }) => {
    const { value, items } = opts
    return (
      <For each={items}>
        {(item) => (
          <a href="#" {...api().getLinkProps({ value })}>
            {item}
          </a>
        )}
      </For>
    )
  }

  return (
    <>
      <main class="navigation-menu basic">
        <div {...api().getRootProps()}>
          <div {...api().getListProps()}>
            <div {...api().getItemProps({ value: "products" })}>
              <button {...api().getTriggerProps({ value: "products" })}>
                Products
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "products" })}>
                <Presence {...api().getIndicatorProps()}>
                  <div {...api().getArrowProps()} />
                </Presence>
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
              </Presence>
            </div>

            <div {...api().getItemProps({ value: "company" })}>
              <button {...api().getTriggerProps({ value: "company" })}>
                Company
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "company" })}>
                <Presence {...api().getIndicatorProps()}>
                  <div {...api().getArrowProps()} />
                </Presence>
                {renderLinks({
                  value: "company",
                  items: ["About Us", "Leadership Team", "Careers", "Press Releases"],
                })}
              </Presence>
            </div>

            <div {...api().getItemProps({ value: "developers" })}>
              <button {...api().getTriggerProps({ value: "developers" })}>
                Developers
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "developers" })}>
                <Presence {...api().getIndicatorProps()}>
                  <div {...api().getArrowProps()} />
                </Presence>
                {renderLinks({
                  value: "developers",
                  items: ["Investors", "Partners", "Corporate Responsibility"],
                })}
              </Presence>
            </div>

            <div {...api().getItemProps({ value: "pricing" })}>
              <a href="#" {...api().getLinkProps({ value: "pricing" })}>
                Pricing
              </a>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
