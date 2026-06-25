import { toastControls } from "@zag-js/shared"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { ToastItem } from "../../components/toast-item"
import { Dialog } from "../../components/dialog"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Controls } from "../../components/controls"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/toast.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="toast" x-toast-group="{id: $id('toast'), store: $toasterStacked, ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main x-data="{id: null}">
            <Dialog />
            <div style={{ display: "flex", gap: "16px" }}>
              <button x-on:click="$toasterStacked.create({title: 'Fetching data...', type: 'loading'})">
                Notify (Loading)
              </button>
              <button
                x-on:click="id = $toasterStacked.create({
                  title: 'Ooops! Something was wrong',
                  type: 'error',
                  onStatusChange(details) {
                    console.log(details)
                  },
                })"
              >
                Notify (Error)
              </button>
              <button
                x-on:click="() => {
                  if (!id) return;
                  $toasterStacked.update(id, {
                    title: 'Testing',
                    type: 'loading',
                  })
                }"
              >
                Update Latest
              </button>
              <button
                class="toast-button"
                x-on:click="() => {
                  const promise = new Promise<{ name: string }>((resolve) => {
                    setTimeout(() => {
                      resolve({ name: 'Chakra' })
                    }, 3000)
                  });

                  $toasterStacked.promise(promise, {
                    loading: { title: 'Creating toast...' },
                    success: (data) => {
                      return { title: `${data.name} toast added` }
                    },
                    error: { title: 'Error' },
                  })
                }"
              >
                Promise
              </button>
              <button
                x-on:click="$toastStacked.create({
                  type: 'info',
                  title: `<h1 style={{ color: 'red' }}>Hello</h1>`,
                  description: `<p>This is a description</p>`
                })"
              >
                Create (JSX)
              </button>

              <button x-on:click="$toasterStacked.dismiss()">Close all</button>
              <button x-on:click="$toasterStacked.pause()">Pause all</button>
              <button x-on:click="$toasterStacked.resume()">Resume all</button>
            </div>

            <template x-teleport="body">
              <div x-toast-group:group>
                <template x-for="(toast, index) in $toastGroup().getToasts()" x-bind:key="toast.id">
                  <ToastItem x-data="{actor: toast, index, parent: _x_toast_group_service}" />
                </template>
              </div>
            </template>
          </main>

          <Toolbar>
            <Controls config={toastControls} />
            <StateVisualizer label="toast-group" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
