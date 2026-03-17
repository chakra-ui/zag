import { navigationMenuControls } from "@zag-js/shared"
import { ChevronDown } from "lucide-static"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  const renderLinks = (opts: { value: string; items: string[] }) => {
    const { value, items } = opts
    return items.map((item, index) => (
      <a href="#" x-navigation-menu:link={`{value: '${value}'}`}>
        {item}
      </a>
    ))
  }

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/navigation-menu.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="navigationMenu" x-navigation-menu="{id: $id('menu'), ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="navigation-menu basic">
            <div x-navigation-menu:root>
              <div x-navigation-menu:list>
                <div x-navigation-menu:item="{value: 'products'}">
                  <button x-navigation-menu:trigger="{value: 'products'}">
                    Products
                    {html(ChevronDown)}
                  </button>
                  <Presence
                    x-navigation-menu:content="{value: 'products'}"
                    x-data="{get present() {return $navigationMenu().open}}"
                  >
                    <Presence x-navigation-menu:indicator x-data="{get present() {return $navigationMenu().open}}">
                      <div x-navigation-menu:arrow />
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

                <div x-navigation-menu:item="{value: 'company'}">
                  <button x-navigation-menu:trigger="{value: 'company'}">
                    Company
                    {html(ChevronDown)}
                  </button>
                  <Presence
                    x-navigation-menu:content="{value: 'company'}"
                    x-data="{get present() {return $navigationMenu().open}}"
                  >
                    <Presence x-navigation-menu:indicator x-data="{get present() {return $navigationMenu().open}}">
                      <div x-navigation-menu:arrow />
                    </Presence>
                    {renderLinks({
                      value: "company",
                      items: ["About Us", "Leadership Team", "Careers", "Press Releases"],
                    })}
                  </Presence>
                </div>

                <div x-navigation-menu:item="{value: 'developers'}">
                  <button x-navigation-menu:trigger="{value: 'developers'}">
                    Developers
                    {html(ChevronDown)}
                  </button>
                  <Presence
                    x-navigation-menu:content="{value: 'developers'}"
                    x-data="{get present() {return $navigationMenu().open}}"
                  >
                    <Presence x-navigation-menu:indicator x-data="{get present() {return $navigationMenu().open}}">
                      <div x-navigation-menu:arrow />
                    </Presence>
                    {renderLinks({
                      value: "developers",
                      items: ["Investors", "Partners", "Corporate Responsibility"],
                    })}
                  </Presence>
                </div>

                <div x-navigation-menu:item="{value: 'pricing'}">
                  <a x-navigation-menu:link="{value: 'pricing'}" href="#">
                    Pricing
                  </a>
                </div>
              </div>
            </div>
          </main>

          <Toolbar viz>
            <Controls config={navigationMenuControls} slot="controls" />
            <StateVisualizer label="navigation-menu" context={["value", "previousValue"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
