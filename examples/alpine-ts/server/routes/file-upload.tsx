import { defineHandler } from "nitro/h3"
import { fileUploadControls, getControlDefaults } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(fileUploadControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/file-upload.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-file-upload={`{id: $id('file-upload'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="file-upload">
            <div x-file-upload:root>
              <div x-file-upload:dropzone>
                <input data-testid="input" x-file-upload:hidden-input />
                Drag your files here
              </div>

              <button x-file-upload:trigger>Choose Files...</button>

              <ul x-file-upload:item-group>
                <template x-for="file in $fileUpload().acceptedFiles" x-bind:key="file.name">
                  <li class="file" x-file-upload:item="{ file }">
                    <div>
                      <b x-text="file.name"></b>
                    </div>
                    <div x-file-upload:item-size-text="{ file }" x-text="$fileUpload().getFileSize(file)"></div>
                    <div x-text="file.type"></div>
                    <button x-file-upload:item-delete-trigger="{ file }">X</button>
                  </li>
                </template>
              </ul>
            </div>
          </main>

          <Toolbar>
            <Controls config={fileUploadControls} state={state} slot="controls" />
            <StateVisualizer label="file-upload" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
