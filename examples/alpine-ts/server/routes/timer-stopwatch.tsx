import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/timer.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-id="['timer']" x-timer="{id: $id('timer'), autoStart: true}">
          <Nav pathname={event.url.pathname} />

          <main class="timer">
            <div x-timer:root>
              <div x-timer:area>
                <div x-timer:item="{type: 'days'}" x-text="$timer.formattedTime.days"></div>
                <div x-timer:separator>:</div>
                <div x-timer:item="{type: 'hours'}" x-text="$timer.formattedTime.hours"></div>
                <div x-timer:separator>:</div>
                <div x-timer:item="{type: 'minutes'}" x-text="$timer.formattedTime.minutes"></div>
                <div x-timer:separator>:</div>
                <div x-timer:item="{type: 'seconds'}" x-text="$timer.formattedTime.seconds"></div>
              </div>

              <div x-timer:control>
                <button x-timer:action-trigger="{action: 'start'}">START</button>
                <button x-timer:action-trigger="{action: 'pause'}">PAUSE</button>
                <button x-timer:action-trigger="{action: 'resume'}">RESUME</button>
                <button x-timer:action-trigger="{action: 'reset'}">RESET</button>
              </div>
            </div>
          </main>

          <Toolbar controls={false} viz>
            <StateVisualizer label="timer" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
