import { getControlDefaults, qrCodeControls } from "@zag-js/shared"
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
        <script type="module" src="/scripts/qr-code.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="qrCode" x-qr-code="{id: $id('qr-code'), encoding: {ecc: 'H'}, ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

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
            <Controls config={qrCodeControls} slot="controls" />
            <StateVisualizer label="qr-code" omit={["encoded"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
