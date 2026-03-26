import styles from "../../../../../shared/src/css/navigation-menu.module.css"
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
          <a href="#" {...api().getLinkProps({ value })} class={styles.Link}>
            {item}
          </a>
        )}
      </For>
    )
  }

  return (
    <>
      <main class="navigation-menu basic">
        <div {...api().getRootProps()} class={styles.Root}>
          <div {...api().getListProps()} class={styles.List}>
            <div {...api().getItemProps({ value: "products" })} class={styles.Item}>
              <button {...api().getTriggerProps({ value: "products" })} class={styles.Trigger}>
                Products
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "products" })} class={styles.Content}>
                <Presence {...api().getIndicatorProps()} class={styles.Indicator}>
                  <div {...api().getArrowProps()} class={styles.Arrow} />
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

            <div {...api().getItemProps({ value: "company" })} class={styles.Item}>
              <button {...api().getTriggerProps({ value: "company" })} class={styles.Trigger}>
                Company
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "company" })} class={styles.Content}>
                <Presence {...api().getIndicatorProps()} class={styles.Indicator}>
                  <div {...api().getArrowProps()} class={styles.Arrow} />
                </Presence>
                {renderLinks({
                  value: "company",
                  items: ["About Us", "Leadership Team", "Careers", "Press Releases"],
                })}
              </Presence>
            </div>

            <div {...api().getItemProps({ value: "developers" })} class={styles.Item}>
              <button {...api().getTriggerProps({ value: "developers" })} class={styles.Trigger}>
                Developers
                <ChevronDown />
              </button>
              <Presence {...api().getContentProps({ value: "developers" })} class={styles.Content}>
                <Presence {...api().getIndicatorProps()} class={styles.Indicator}>
                  <div {...api().getArrowProps()} class={styles.Arrow} />
                </Presence>
                {renderLinks({
                  value: "developers",
                  items: ["Investors", "Partners", "Corporate Responsibility"],
                })}
              </Presence>
            </div>

            <div {...api().getItemProps({ value: "pricing" })} class={styles.Item}>
              <a href="#" {...api().getLinkProps({ value: "pricing" })} class={styles.Link}>
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
