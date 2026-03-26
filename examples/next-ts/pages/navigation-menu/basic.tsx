import styles from "../../../../shared/src/css/navigation-menu.module.css"
import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { navigationMenuControls } from "@zag-js/shared"
import { ChevronDown } from "lucide-react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
      <a href="#" key={`${value}-${item}-${index}`} {...api.getLinkProps({ value })} className={styles.Link}>
        {item}
      </a>
    ))
  }

  return (
    <>
      <main className="navigation-menu basic">
        <div {...api.getRootProps()} className={styles.Root}>
          <div {...api.getListProps()} className={styles.List}>
            <div {...api.getItemProps({ value: "products" })} className={styles.Item}>
              <button {...api.getTriggerProps({ value: "products" })} className={styles.Trigger}>
                Products
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "products" })} className={styles.Content}>
                <Presence {...api.getIndicatorProps()} className={styles.Indicator}>
                  <div {...api.getArrowProps()} className={styles.Arrow} />
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

            <div {...api.getItemProps({ value: "company" })} className={styles.Item}>
              <button {...api.getTriggerProps({ value: "company" })} className={styles.Trigger}>
                Company
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "company" })} className={styles.Content}>
                <Presence {...api.getIndicatorProps()} className={styles.Indicator}>
                  <div {...api.getArrowProps()} className={styles.Arrow} />
                </Presence>
                {renderLinks({
                  value: "company",
                  items: ["About Us", "Leadership Team", "Careers", "Press Releases"],
                })}
              </Presence>
            </div>

            <div {...api.getItemProps({ value: "developers" })} className={styles.Item}>
              <button {...api.getTriggerProps({ value: "developers" })} className={styles.Trigger}>
                Developers
                <ChevronDown />
              </button>
              <Presence {...api.getContentProps({ value: "developers" })} className={styles.Content}>
                <Presence {...api.getIndicatorProps()} className={styles.Indicator}>
                  <div {...api.getArrowProps()} className={styles.Arrow} />
                </Presence>
                {renderLinks({
                  value: "developers",
                  items: ["Investors", "Partners", "Corporate Responsibility"],
                })}
              </Presence>
            </div>

            <div {...api.getItemProps({ value: "pricing" })} className={styles.Item}>
              <a href="#" {...api.getLinkProps({ value: "pricing" })} className={styles.Link}>
                Pricing
              </a>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} context={["value", "previousValue"]} />
      </Toolbar>
    </>
  )
}
