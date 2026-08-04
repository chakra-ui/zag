import { getControlDefaults, marqueeControls, marqueeData } from "@zag-js/shared"
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
        <script type="module" src="/scripts/marquee.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="marquee" x-marquee="{id: $id('marquee'), spacing: '2rem', ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="marquee">
            <div x-marquee:root>
              <div x-marquee:edge="{side: 'start'}" />

              <div x-marquee:viewport>
                <template x-for="(_, index) in Array.from({length: $marquee().contentCount})" x-bind:key="index">
                  <div x-marquee:content>
                    {marqueeData.map((item) => (
                      <div x-marquee:item>
                        <span class="marquee-logo">{item.logo}</span>
                        <span class="marquee-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </template>
              </div>

              <div x-marquee:edge="{side: 'end'}" />
            </div>

            <div class="controls">
              <button x-on:click="$marquee().pause()">Pause</button>
              <button x-on:click="$marquee().resume()">Resume</button>
              <button x-on:click="$marquee().togglePause()">Toggle</button>
              <span x-text="'Status: ' + ($marquee().paused ? 'Paused' : 'Playing')"></span>
            </div>
          </main>

          <Toolbar>
            <Controls config={marqueeControls} slot="controls" />
            <StateVisualizer label="marquee" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
