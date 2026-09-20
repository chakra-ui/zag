import { radioControls, radioData } from "@zag-js/shared"
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
        <script type="module" src="/scripts/radio-group.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="radio"
          x-radio="{
            id: $id('radio'),
            name: 'fruit',
            orientation: 'horizontal',
            ...context,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

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
            <Controls config={radioControls} slot="controls" />
            <StateVisualizer label="radio" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
