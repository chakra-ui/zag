import { stepsControls } from "@zag-js/shared"
import { defineHandler } from "nitro"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/steps.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="steps" x-steps="{id: $id('steps'), count: $stepsData.length, ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="steps">
            <div x-steps:root>
              <div x-steps:list>
                <template x-for="(step, index) in $stepsData" x-bind:key="index">
                  <div x-steps:item="{ index }">
                    <button x-steps:trigger="{ index }">
                      <div x-steps:indicator="{ index }" x-text="index + 1"></div>
                      <span x-text="step.title"></span>
                    </button>
                    <div x-steps:separator="{ index }" />
                  </div>
                </template>
              </div>

              <template x-for="(step, index) in $stepsData" x-bind:key="index">
                <div x-steps:content="{ index }" x-text="step.title + ' - ' + step.description"></div>
              </template>

              <div x-steps:content="{index: $stepData.length}">
                Steps Complete - Thank you for filling out the form!
              </div>

              <div>
                <button x-steps:prev-trigger>Back</button>
                <button x-steps:next-trigger>Next</button>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={stepsControls} slot="controls" />
            <StateVisualizer label="steps" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
