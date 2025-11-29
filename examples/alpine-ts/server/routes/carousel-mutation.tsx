import { defineHandler } from "nitro/deps/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/carousel.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{index: 0, images: [0, 1, 2, 3, 4]}"
          x-carousel="{
            id: $id('carousel'),
            slideCount: images.length,
            loop: true,
            autoplay: {delay: 1000},
            onPageChange: ({ page }) => {index=page},
            page: index,
          }"
        >
          <Nav pathname={event.url.pathname} />

          <main class="carousel">
            <div x-carousel:root>
              <div x-carousel:control>
                <button x-carousel:autoplay-trigger x-text="$carousel().isPlaying ? 'Stop' : 'Play'"></button>
                <div class="carousel-spacer" />
                <button x-carousel:prev-trigger>&laquo;</button>
                <button x-carousel:next-trigger>&raquo;</button>
              </div>

              <div x-carousel:indicator-group>
                <template x-for="(_, i) in $carousel.pageSnapPoints" x-bind:key="i">
                  <button x-carousel:indicator="{index: i}" x-text="i"></button>
                </template>
              </div>

              <div x-carousel:item-group>
                <template x-for="(image, index) in images" x-bind:key="image">
                  <div x-carousel:item="{ index }">
                    <div
                      style={{
                        width: "188px",
                        height: "188px",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      x-text="'Slide ' + image"
                    ></div>
                  </div>
                </template>
              </div>
            </div>

            <p>
              <button
                x-on:click="() => {
                  const max = Math.max(...images);
                  images = [...images, max + 1];
                }"
              >
                add slide
              </button>
            </p>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="carousel" omit={["translations"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
