import { defineHandler } from "nitro/h3"
import { getControlDefaults, qrCodeControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { Controls } from "../components/controls"

export default defineHandler((event) => {
  const state = getControlDefaults(qrCodeControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/qr-code.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['qr-code']"
          x-qr-code={`{id: $id('qr-code'), encoding: {ecc: 'H'}, ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />
          <main class="qr-code">
            <div x-qr-code:root>
              <svg x-qr-code:frame>
                <path x-qr-code:pattern />
              </svg>
              <div x-qr-code:overlay>
                <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={qrCodeControls} state={state} slot="controls" />
            <StateVisualizer label="qr-code" omit={["encoded"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
