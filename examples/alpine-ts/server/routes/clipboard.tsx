import { defineHandler } from "nitro/h3"
import { clipboardControls, getControlDefaults } from "@zag-js/shared"
import { ClipboardCheck, ClipboardCopy } from "lucide-static"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(clipboardControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/clipboard.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['clipboard']"
          x-clipboard={`{id: $id('clipboard'), value: 'https://github.com/chakra-ui/zag', ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="clipboard">
            <div x-clipboard:root>
              <label x-clipboard:label>Copy this link</label>
              <div x-clipboard:control>
                <input x-clipboard:input />
                <button x-clipboard:trigger>
                  <template x-if="$clipboard.copied">{html(ClipboardCheck)}</template>
                  <template x-if="! $clipboard.copied">{html(ClipboardCopy)}</template>
                </button>
              </div>
              <div x-clipboard:indicator="{copied: true}">Copied!</div>
              <div x-clipboard:indicator="{copied: false}">Copy</div>
            </div>
          </main>

          <Toolbar>
            <Controls config={clipboardControls} state={state} slot="controls" />
            <StateVisualizer label="clipboard" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
