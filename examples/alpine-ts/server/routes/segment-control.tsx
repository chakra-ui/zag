import { defineHandler } from "nitro/h3"
import { getControlDefaults, radioControls, radioData } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(radioControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/radio-group.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-radio={`{
            id: $id('radio'),
            name: 'fruit',
            orientation: 'horizontal',
            ${Object.keys(state)},
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="segmented-control">
            <div x-radio:root>
              <div x-radio:indicator />
              {radioData.map((opt) => (
                <label data-testid={`radio-${opt.id}`} x-radio:item={`{value: '${opt.id}'}`}>
                  <span data-testid={`label-${opt.id}`} x-radio:item-text={`{value: '${opt.id}'}`}>
                    {opt.label}
                  </span>
                  <input data-testid={`input-${opt.id}`} x-radio:item-hidden-input={`{value: '${opt.id}'}`} />
                </label>
              ))}
            </div>
            <button x-on:click="$radio().clearValue()">reset</button>
          </main>

          <Toolbar>
            <Controls config={radioControls} state={state} slot="controls" />
            <StateVisualizer label="radio" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
