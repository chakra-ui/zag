import { defineHandler } from "nitro/h3"
import { angleSliderControls, getControlDefaults } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { Toolbar } from "../components/toolbar"
import { Controls } from "../components/controls"

export default defineHandler((event) => {
  const state = getControlDefaults(angleSliderControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/angle-slider.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['angle-slider']"
          x-angle-slider={`{id: $id('angle-slider'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="angle-slider">
            <div x-angle-slider:root>
              <label x-angle-slider:label>
                Angle Slider: <div x-angle-slider:value-text x-text="$angleSlider().valueAsDegree"></div>
              </label>
              <div x-angle-slider:control>
                <div x-angle-slider:thumb></div>
                <div x-angle-slider:marker-group>
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((value) => (
                    <div x-angle-slider:marker={`{value: ${value}}`}></div>
                  ))}
                </div>
              </div>
              <input x-angle-slider:hidden-input />
            </div>
          </main>

          <Toolbar>
            <Controls config={angleSliderControls} state={state} slot="controls" />
            <StateVisualizer label="angle-slider" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
