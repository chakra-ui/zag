import { tourControls } from "@zag-js/shared"
import { X } from "lucide-static"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { IFrame } from "../../components/iframe"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/tour.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="tour" x-tour="{id: $id('tour'), steps: $tourData, ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="tour">
            <div>
              <button x-on:click="$tour().start()">Start Tour</button>
              <div class="steps__container">
                <h3 id="step-1">Step 1</h3>
                <div class="overflow__container">
                  <div class="h-200px" />
                  <h3 id="step-2">Step 2</h3>
                  <div class="h-100px" />
                </div>
                <IFrame>
                  <h1 id="step-2a">Iframe Content</h1>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </p>
                </IFrame>
                <h3 id="step-3">Step 3</h3>
                <h3 id="step-4">Step 4</h3>
              </div>
            </div>

            <template x-teleport="body">
              <template x-if="$tour().step && $tour().open">
                <div>
                  <template x-if="$tour().step.backdrop">
                    <div x-tour:backdrop />
                  </template>
                  <div x-tour:spotlight />
                  <div x-tour:positioner>
                    <div x-tour:content>
                      <template x-if="$tour().step.arrow">
                        <div x-tour:arrow>
                          <div x-tour:arrow-tip />
                        </div>
                      </template>

                      <p x-tour:title x-text="$tour().step.title"></p>
                      <div x-tour:description x-text="$tour().step.description"></div>
                      <div x-tour:progress-text x-text="$tour().getProgressText()"></div>

                      <template x-if="$tour().step.actions">
                        <div class="tour button__group">
                          <template x-for="action in $tour().step.actions" x-bind:key="action.label">
                            <button x-tour:action-trigger="{ action }" x-text="action.label"></button>
                          </template>
                        </div>
                      </template>

                      <button x-tour:close-trigger>{html(X)}</button>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </main>

          <Toolbar>
            <Controls config={tourControls} slot="controls" />
            <StateVisualizer label="tour" omit={["steps"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
