import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ChevronDown } from "lucide-react"
import { useId } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useEffectOnce } from "../hooks/use-effect-once"

export default function Page() {
  const rootService = useMachine(navigationMenu.machine, { id: useId() })
  const rootMenu = navigationMenu.connect(rootService, normalizeProps)

  const productService = useMachine(navigationMenu.machine, { id: useId(), value: "extensibility" })
  const productSubmenu = navigationMenu.connect(productService, normalizeProps)

  const companyService = useMachine(navigationMenu.machine, { id: useId(), value: "customers" })
  const companySubmenu = navigationMenu.connect(companyService, normalizeProps)

  const renderLinks = (menu: typeof rootMenu, opts: { value: string; items: string[] }) => {
    const { value, items } = opts
    return items.map((item, index) => (
      <a href="#" key={`${value}-${item}-${index}`} {...menu.getLinkProps({ value })}>
        {item}
      </a>
    ))
  }

  useEffectOnce(() => {
    productSubmenu.setParent(rootService)
    rootMenu.setChild(productService)
  })

  useEffectOnce(() => {
    companySubmenu.setParent(rootService)
    rootMenu.setChild(companyService)
  })

  return (
    <>
      <main className="navigation-menu nested">
        <Navbar>
          <div {...rootMenu.getRootProps()}>
            <div {...rootMenu.getListProps()}>
              <div {...rootMenu.getItemProps({ value: "products" })}>
                <button {...rootMenu.getTriggerProps({ value: "products" })}>
                  Products
                  <ChevronDown />
                </button>
              </div>

              <div {...rootMenu.getItemProps({ value: "company" })}>
                <button {...rootMenu.getTriggerProps({ value: "company" })}>
                  Company
                  <ChevronDown />
                </button>
              </div>

              <div {...rootMenu.getItemProps({ value: "developers", disabled: true })}>
                <button {...rootMenu.getTriggerProps({ value: "developers", disabled: true })}>
                  Developers
                  <ChevronDown />
                </button>
              </div>

              <div {...rootMenu.getItemProps({ value: "pricing" })}>
                <a href="#" {...rootMenu.getLinkProps({ value: "pricing" })}>
                  Pricing
                </a>
              </div>
            </div>

            <Presence {...rootMenu.getViewportProps()}>
              <Presence {...rootMenu.getContentProps({ value: "products" })}>
                <div {...productSubmenu.getRootProps()}>
                  <div {...productSubmenu.getIndicatorTrackProps()}>
                    <div {...productSubmenu.getListProps()}>
                      <div {...productSubmenu.getItemProps({ value: "extensibility" })}>
                        <button {...productSubmenu.getTriggerProps({ value: "extensibility" })}>Extensibility</button>
                      </div>

                      <div {...productSubmenu.getItemProps({ value: "security" })}>
                        <button {...productSubmenu.getTriggerProps({ value: "security" })}>Security</button>
                      </div>

                      <div {...productSubmenu.getItemProps({ value: "authentication" })}>
                        <button {...productSubmenu.getTriggerProps({ value: "authentication" })}>Authentication</button>
                      </div>
                      <div {...productSubmenu.getIndicatorProps()} />
                    </div>
                  </div>

                  <Presence {...productSubmenu.getViewportProps()}>
                    <Presence
                      {...productSubmenu.getContentProps({ value: "extensibility" })}
                      style={{
                        gridTemplateColumns: "1.5fr 1fr 1fr",
                      }}
                    >
                      {renderLinks(productSubmenu, {
                        value: "extensibility",
                        items: ["Donec quis dui", "Vestibulum", "Nunc dignissim"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "extensibility",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "extensibility",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                    </Presence>

                    <Presence
                      {...productSubmenu.getContentProps({ value: "security" })}
                      style={{
                        gridTemplateColumns: "1fr 1fr 1fr",
                      }}
                    >
                      {renderLinks(productSubmenu, {
                        value: "security",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque", "Vestibulum"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "security",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "security",
                        items: ["Fusce pellentesque", "Aliquam porttitor"],
                      })}
                    </Presence>

                    <Presence
                      {...productSubmenu.getContentProps({ value: "authentication" })}
                      style={{
                        gridTemplateColumns: "1.5fr 1fr 1fr",
                      }}
                    >
                      {renderLinks(productSubmenu, {
                        value: "authentication",
                        items: ["Donec quis dui", "Vestibulum", "Nunc dignissim"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "authentication",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "authentication",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                    </Presence>
                  </Presence>
                </div>
              </Presence>

              <Presence {...rootMenu.getContentProps({ value: "company" })}>
                <div {...companySubmenu.getRootProps()}>
                  <div {...companySubmenu.getIndicatorTrackProps()}>
                    <div {...companySubmenu.getListProps()}>
                      <div {...companySubmenu.getItemProps({ value: "customers" })}>
                        <button {...companySubmenu.getTriggerProps({ value: "customers" })}>Customers</button>
                      </div>

                      <div {...companySubmenu.getItemProps({ value: "partners" })}>
                        <button {...companySubmenu.getTriggerProps({ value: "partners" })}>Partners</button>
                      </div>

                      <div {...companySubmenu.getItemProps({ value: "enterprise" })}>
                        <button {...companySubmenu.getTriggerProps({ value: "enterprise" })}>Enterprise</button>
                      </div>
                    </div>
                    <div {...companySubmenu.getIndicatorProps()} />
                  </div>

                  <Presence {...companySubmenu.getViewportProps()}>
                    <Presence
                      {...companySubmenu.getContentProps({ value: "customers" })}
                      style={{
                        gridTemplateColumns: "1.5fr 1fr",
                      }}
                    >
                      {renderLinks(companySubmenu, {
                        value: "customers",
                        items: ["Donec quis dui", "Vestibulum", "Nunc dignissim"],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "customers",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                    </Presence>

                    <Presence
                      {...companySubmenu.getContentProps({ value: "partners" })}
                      style={{
                        gridTemplateColumns: "1fr 1fr",
                      }}
                    >
                      {renderLinks(companySubmenu, {
                        value: "partners",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque", "Vestibulum"],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "partners",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                    </Presence>

                    <Presence
                      {...companySubmenu.getContentProps({ value: "enterprise" })}
                      style={{
                        gridTemplateColumns: "1.5fr 1fr",
                      }}
                    >
                      {renderLinks(companySubmenu, {
                        value: "enterprise",
                        items: ["Donec quis dui", "Vestibulum", "Nunc dignissim"],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "enterprise",
                        items: ["Fusce pellentesque", "Aliquam porttitor", "Pellentesque"],
                      })}
                    </Presence>
                  </Presence>
                </div>
              </Presence>

              <Presence {...rootMenu.getContentProps({ value: "developers" })}>
                {renderLinks(rootMenu, {
                  value: "developers",
                  items: ["Donec quis dui", "Vestibulum", "Fusce pellentesque", "Aliquam porttitor"],
                })}
                {renderLinks(rootMenu, {
                  value: "developers",
                  items: ["Fusce pellentesque", "Aliquam porttitor"],
                })}
              </Presence>
            </Presence>
          </div>
        </Navbar>
      </main>

      <Toolbar viz>
        <StateVisualizer state={rootService} label="root" />
        <StateVisualizer state={productService} label="product" />
        <StateVisualizer state={companyService} label="company" />
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
