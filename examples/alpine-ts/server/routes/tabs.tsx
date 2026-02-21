import { defineHandler } from "nitro/h3"
import { getControlDefaults, tabsControls, tabsData } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(tabsControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tabs.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['tabs']"
          x-tabs={`{id: $id('tabs'), defaultValue: 'nils', ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="tabs">
            <div x-tabs:root>
              <div x-tabs:indicator />
              <div x-tabs:list>
                {tabsData.map((data) => (
                  <button x-tabs:trigger={`{value: '${data.id}'}`} data-testid={`${data.id}-tab`}>
                    {data.label}
                  </button>
                ))}
              </div>
              {tabsData.map((data) => (
                <div x-tabs:content={`{value: '${data.id}'}`} data-testid={`${data.id}-tab-panel`}>
                  <p>{data.content}</p>
                  {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
                </div>
              ))}
            </div>
          </main>

          <Toolbar>
            <Controls config={tabsControls} state={state} slot="controls" />
            <StateVisualizer label="tabs" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
