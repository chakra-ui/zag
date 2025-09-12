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

  const productService = useMachine(navigationMenu.machine, { id: useId(), defaultValue: "extensibility" })
  const productSubmenu = navigationMenu.connect(productService, normalizeProps)

  const companyService = useMachine(navigationMenu.machine, { id: useId(), defaultValue: "customers" })
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
                <span {...rootMenu.getTriggerProxyProps({ value: "products" })} />
              </div>

              <div {...rootMenu.getItemProps({ value: "company" })}>
                <button {...rootMenu.getTriggerProps({ value: "company" })}>
                  Company
                  <ChevronDown />
                </button>
                <span {...rootMenu.getTriggerProxyProps({ value: "company" })} />
              </div>

              <div {...rootMenu.getItemProps({ value: "developers", disabled: true })}>
                <button {...rootMenu.getTriggerProps({ value: "developers", disabled: true })}>
                  Developers
                  <ChevronDown />
                </button>
                <span {...rootMenu.getTriggerProxyProps({ value: "developers" })} />
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
                        <span {...productSubmenu.getTriggerProxyProps({ value: "extensibility" })} />
                      </div>

                      <div {...productSubmenu.getItemProps({ value: "security" })}>
                        <button {...productSubmenu.getTriggerProps({ value: "security" })}>Security</button>
                        <span {...productSubmenu.getTriggerProxyProps({ value: "security" })} />
                      </div>

                      <div {...productSubmenu.getItemProps({ value: "authentication" })}>
                        <button {...productSubmenu.getTriggerProps({ value: "authentication" })}>Authentication</button>
                        <span {...productSubmenu.getTriggerProxyProps({ value: "authentication" })} />
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
                        items: ["API Extensions", "Plugin System", "Custom Hooks", "Integration Tools"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "extensibility",
                        items: ["Webhooks", "Event Handlers", "Middleware", "SDKs"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "extensibility",
                        items: ["Connectors", "Adapters", "Bridges", "Extensions"],
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
                        items: ["Authentication", "Authorization", "Encryption", "SSL/TLS"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "security",
                        items: ["Firewall", "DDoS Protection", "Security Audit"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "security",
                        items: ["Access Control", "Identity Management"],
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
                        items: ["OAuth", "SAML", "JWT", "Multi-factor Auth"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "authentication",
                        items: ["Social Login", "Passwordless", "Biometrics"],
                      })}
                      {renderLinks(productSubmenu, {
                        value: "authentication",
                        items: ["SSO", "User Management", "Role-based Access"],
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
                        <span {...companySubmenu.getTriggerProxyProps({ value: "customers" })} />
                      </div>

                      <div {...companySubmenu.getItemProps({ value: "partners" })}>
                        <button {...companySubmenu.getTriggerProps({ value: "partners" })}>Partners</button>
                        <span {...companySubmenu.getTriggerProxyProps({ value: "partners" })} />
                      </div>

                      <div {...companySubmenu.getItemProps({ value: "enterprise" })}>
                        <button {...companySubmenu.getTriggerProps({ value: "enterprise" })}>Enterprise</button>
                        <span {...companySubmenu.getTriggerProxyProps({ value: "enterprise" })} />
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
                        items: ["Customer Stories", "Case Studies", "Testimonials", "Success Metrics"],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "customers",
                        items: ["Customer Support", "Help Center", "Documentation"],
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
                        items: ["Partner Program", "Channel Partners", "Technology Partners", "Resellers"],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "partners",
                        items: ["Integration Partners", "Consulting Partners", "System Integrators"],
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
                        items: [
                          "Enterprise Solutions",
                          "Large Scale Deployments",
                          "Custom Development",
                          "Dedicated Teams",
                        ],
                      })}
                      {renderLinks(companySubmenu, {
                        value: "enterprise",
                        items: ["Enterprise Support", "SLA Agreements", "Compliance"],
                      })}
                    </Presence>
                  </Presence>
                </div>
              </Presence>

              <Presence {...rootMenu.getContentProps({ value: "developers" })}>
                {renderLinks(rootMenu, {
                  value: "developers",
                  items: ["Documentation", "API Reference", "SDKs", "Code Samples"],
                })}
                {renderLinks(rootMenu, {
                  value: "developers",
                  items: ["GitHub", "Changelog", "Release Notes"],
                })}
              </Presence>
            </Presence>
          </div>
        </Navbar>
      </main>

      <Toolbar viz>
        <StateVisualizer state={rootService} label="root" context={["value", "previousValue"]} />
        <StateVisualizer state={productService} label="product" context={["value", "previousValue", "isSubmenu"]} />
        <StateVisualizer state={companyService} label="company" context={["value", "previousValue", "isSubmenu"]} />
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
