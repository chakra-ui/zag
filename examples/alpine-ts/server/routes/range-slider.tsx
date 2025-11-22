import { defineHandler } from "nitro/h3"
import { getControlDefaults, sliderControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(sliderControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/slider.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['slider']"
          x-slider={`{
            id: $id('slider'),
            name: 'quantity',
            defaultValue: [10, 60],
            ${Object.keys(state)},
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="slider">
            <form
              // ensure we can read the value within forms
              x-on:change="(e) => {
                const formData = $serialize(e.currentTarget, { hash: true })
                console.log(formData)
              }"
            >
              <div x-slider:root>
                <div>
                  <label x-slider:label>Quantity:</label>
                  <output x-slider:value-text x-text="$slider.value.join(' - ')"></output>
                </div>
                <div class="control-area">
                  <div x-slider:control>
                    <div x-slider:track>
                      <div x-slider:range />
                    </div>
                    <template x-for="(_, index) in $slider.value" x-bind:key="index">
                      <div x-slider:thumb="{ index }">
                        <input x-slider:hidden-input="{ index }" />
                      </div>
                    </template>
                  </div>
                  <div x-slider:marker-group>
                    <span x-slider:marker="{value: 10}">*</span>
                    <span x-slider:marker="{value: 30}">*</span>
                    <span x-slider:marker="{value: 50}">*</span>
                    <span x-slider:marker="{value: 90}">*</span>
                  </div>
                </div>
              </div>
            </form>
          </main>

          <Toolbar>
            <Controls config={sliderControls} state={state} slot="controls" />
            <StateVisualizer label="slider" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
