import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/avatar.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{src: $getRandomImage(), showImage: true}"
          x-id="['avatar']"
          x-avatar="{id: $id('avatar')}"
        >
          <Nav pathname={event.url.pathname} />

          <main class="avatar">
            <div x-avatar:root>
              <span x-avatar:fallback>PA</span>
              <template x-if="showImage">
                <img alt="" referRerpolicy="no-referrer" x-bind:src="src" x-avatar:image />
              </template>
            </div>

            <div class="controls">
              <button x-on:click="src = $getRandomImage()">Change Image</button>
              <button x-on:click="src = $broken">Broken Image</button>
              <button x-on:click="showImage = !showImage">Toggle Image</button>
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="avatar" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
