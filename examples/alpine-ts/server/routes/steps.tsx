import { defineHandler } from "nitro/h3"
import { getControlDefaults, stepsControls, stepsData } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(stepsControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/steps.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['steps']"
          x-steps={`{id: $id('steps'), count: ${stepsData.length}, ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="steps">
            <div x-steps:root>
              <div x-steps:list>
                {stepsData.map((step, index) => (
                  <div x-steps:item={`{index: ${index}}`}>
                    <button x-steps:trigger={`{index: ${index}}`}>
                      <div x-steps:indicator={`{index: ${index}}`}>{index + 1}</div>
                      <span>{step.title}</span>
                    </button>
                    <div x-steps:separator={`{index: ${index}}`} />
                  </div>
                ))}
              </div>

              {stepsData.map((step, index) => (
                <div x-steps:content={`{index: ${index}}`}>
                  {step.title} - {step.description}
                </div>
              ))}

              <div x-steps:content={`{index: ${stepsData.length}}`}>
                Steps Complete - Thank you for filling out the form!
              </div>

              <div>
                <button x-steps:prev-trigger>Back</button>
                <button x-steps:next-trigger>Next</button>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={stepsControls} state={state} slot="controls" />
            <StateVisualizer label="steps" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
