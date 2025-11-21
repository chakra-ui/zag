import { defineHandler } from "nitro/h3"
import { colorPickerControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

const presets = ["#f47373", "#697689"]

const EyeDropIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="m4 15.76-1 4A1 1 0 0 0 3.75 21a1 1 0 0 0 .49 0l4-1a1 1 0 0 0 .47-.26L17 11.41l1.29 1.3 1.42-1.42-1.3-1.29L21 7.41a2 2 0 0 0 0-2.82L19.41 3a2 2 0 0 0-2.82 0L14 5.59l-1.3-1.3-1.42 1.42L12.58 7l-8.29 8.29a1 1 0 0 0-.29.47zm1.87.75L14 8.42 15.58 10l-8.09 8.1-2.12.53z"></path>
  </svg>
)

export default defineHandler((event) => {
  const state = getControlDefaults(colorPickerControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/color-picker.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['color-picker']"
          x-color-picker={`{
            id: $id('color-picker'),
            name: 'color',
            format: 'hsla',
            defaultValue: $parse('hsl(0, 100%, 50%)'),
            ${Object.keys(state)},
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="color-picker">
            <form
              x-on:change="(e) => {
                console.log('change:', $serialize(e.currentTarget, { hash: true }))
              }"
            >
              <input x-color-picker:hidden-input />
              <div x-color-picker:root>
                <label x-color-picker:label>
                  Select Color: <span data-testid="value-text" x-text="$colorPicker.valueAsString"></span>
                </label>

                <div x-color-picker:control>
                  <button x-color-picker:trigger>
                    <div x-color-picker:transparency-grid="{size: '10px'}" />
                    <div x-color-picker:swatch="{value: $colorPicker.value}" />
                  </button>
                  <input x-color-picker:channel-input="{channel: 'hex'}" />
                  <input x-color-picker:channel-input="{channel: 'alpha'}" />
                </div>

                <div x-color-picker:positioner>
                  <div x-color-picker:content>
                    <div class="content__inner">
                      <div x-color-picker:area>
                        <div x-color-picker:area-background />
                        <div x-color-picker:area-thumb />
                      </div>

                      <div x-color-picker:channel-slider="{channel: 'hue'}">
                        <div x-color-picker:channel-slider-track="{channel: 'hue'}" />
                        <div x-color-picker:channel-slider-thumb="{channel: 'hue'}" />
                      </div>

                      <div x-color-picker:channel-slider="{channel: 'alpha'}">
                        <div x-color-picker:transparency-grid="{size: '12px'}" />
                        <div x-color-picker:channel-slider-track="{channel: 'alpha'}" />
                        <div x-color-picker:channel-slider-thumb="{channel: 'alpha'}" />
                      </div>

                      <template x-if="$colorPicker.format.startsWith('hsl')">
                        <div style={{ display: "flex", width: "100%" }}>
                          <span>H</span>
                          <input x-color-picker:channel-input="{channel: 'hue'}" />
                          <span>S</span>
                          <input x-color-picker:channel-input="{channel: 'saturation'}" />
                          <span>L</span>
                          <input x-color-picker:channel-input="{channel: 'lightness'}" />
                          <span>A</span>
                          <input x-color-picker:channel-input="{channel: 'alpha'}" />
                        </div>
                      </template>

                      <template x-if="$colorPicker.format.startsWith('rgb')">
                        <div style={{ display: "flex", width: "100%" }}>
                          <span>R</span>
                          <input x-color-picker:channel-input="{channel: 'red'}" />
                          <span>G</span>
                          <input x-color-picker:channel-input="{channel: 'green'}" />
                          <span>B</span>
                          <input x-color-picker:channel-input="{channel: 'blue'}" />
                          <span>A</span>
                          <input x-color-picker:channel-input="{channel: 'alpha'}" />
                        </div>
                      </template>

                      <template x-if="$colorPicker.format.startsWith('hsb')">
                        <div style={{ display: "flex", width: "100%" }}>
                          <span>H</span>
                          <input x-color-picker:channel-input="{channel: 'hue'}" />
                          <span>S</span>
                          <input x-color-picker:channel-input="{channel: 'saturation'}" />
                          <span>B</span>
                          <input x-color-picker:channel-input="{channel: 'brightness'}" />
                          <span>A</span>
                          <input x-color-picker:channel-input="{channel: 'alpha'}" />
                        </div>
                      </template>

                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                          <div x-color-picker:transparency-grid="{size: '4px'}" />
                          <div x-color-picker:swatch="{value: $colorPicker.value}" />
                        </div>
                        <p data-testid="value-text" x-text="$colorPicker.valueAsString"></p>
                      </div>

                      <input x-color-picker:channel-input="{channel: 'hex'}" />

                      <div x-color-picker:swatch-group style={{ display: "flex", gap: "10px" }}>
                        {presets.map((preset) => (
                          <button x-color-picker:swatch-trigger={`{value: '${preset}'}`}>
                            <div style={{ position: "relative" }}>
                              <div x-color-picker:transparency-grid="{size: '4px'}" />
                              <div x-color-picker:swatch={`{value: '${preset}'}`} />
                            </div>
                          </button>
                        ))}
                      </div>

                      <button x-color-picker:eye-dropper-trigger>
                        <EyeDropIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button type="submit">Submit</button>
              <button type="reset">Reset</button>
            </form>
          </main>

          <Toolbar viz>
            <Controls config={colorPickerControls} state={state} slot="controls" />
            <StateVisualizer label="color-picker" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
