import { defineHandler } from "nitro/h3"
import { accordionControls, accordionData, getControlDefaults } from "@zag-js/shared"
import { ArrowRight } from "lucide-static"
import Head from "~/server/components/Head"
import Nav from "~/server/components/Nav"

export default defineHandler((event) => {
  const controls = getControlDefaults(accordionControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/accordion.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(controls)}
          x-id="['accordion']"
          x-accordion={`{id: $id('accordion'), ${Object.keys(controls)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="accordion">
            <div x-accordion:root>
              {accordionData.map((item) => (
                <div x-accordion:item={`{value: '${item.id}'}`}>
                  <h3>
                    <button data-testid={`${item.id}:trigger`} x-accordion:item-trigger={`{value: '${item.id}'}`}>
                      {item.label}
                      <div x-accordion:item-indicator={`{value: '${item.id}'}`}>{html(ArrowRight)}</div>
                    </button>
                  </h3>
                  <div data-testid={`${item.id}:content`} x-accordion:item-content={`{value: '${item.id}'}`}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
})
