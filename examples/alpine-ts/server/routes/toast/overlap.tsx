import { toastControls } from "@zag-js/shared"
import { defineHandler } from "nitro"
import { Dialog } from "../../components/dialog"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { ToastItem } from "../../components/toast-item"
import { Toolbar } from "../../components/toolbar"
import { Controls } from "../../components/controls"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/toast.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="toast" x-toast-group="{id: $id('toast'), store: $toasterOverlap, ...context}">
          <Nav currentComponent={event.context.currentComponent as string} />

          <main x-data="{id: null}">
            <Dialog />
            <div style={{ display: "flex", gap: "16px" }}>
              <button x-on:click="$toasterOverlap.create({title: 'Fetching data...', type: 'loading'})">
                Notify (Loading)
              </button>
              <button
                x-on:click="id = $toasterOverlap.create({
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
                  $toasterOverlap.update(id, {
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
                  const promise = new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ name: 'Chakra' })
                    }, 3000)
                  });

                  $toasterOverlap.promise(promise, {
                    loading: { title: 'Creating toast...' },
                    success: (data) => {
                      return { title: `${data.name} toast added` }
                    },
                    error: { title: 'Error' },
                  });
                }"
              >
                Promise
              </button>
              <button
                x-on:click="$toasterOverlap.create({
                  type: 'info',
                  title: `<h1 style={{ color: 'red' }}>Hello</h1>`,
                  description: `<p>This is a description</p>`
                })"
              >
                Create (JSX)
              </button>

              <button x-on:click="$toasterOverlap.dismiss()">Close all</button>
              <button x-on:click="$toasterOverlap.pause()">Pause all</button>
              <button x-on:click="$toasterOverlap.resume()">Resume all</button>
            </div>

            <template x-teleport="body">
              <div x-toast-group:group>
                <template x-for="(toast, index) in $toastGroup().getToasts()" x-bind:key="toast.id">
                  <ToastItem x-data="{parent: $toastGroup().service}" />
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
