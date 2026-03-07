import { defineHandler } from "nitro/h3"
import { carouselControls, carouselData } from "@zag-js/shared"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/carousel.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="carousel"
          x-carousel={`{
            id: $id('carousel'),
            spacing: '20px',
            slidesPerPage: 2,
            slideCount: ${carouselData.length},
            allowMouseDrag: true,
            ...context,
          }`}
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="carousel">
            <div x-carousel:root>
              <button x-on:click="$carousel().scrollToIndex(4)">Scroll to 4</button>
              <div x-carousel:control>
                <button x-carousel:autoplay-trigger x-text="$carousel().isPlaying ? 'Stop' : 'Play'"></button>
                <div class="carousel-spacer" />
                <button x-carousel:prev-trigger>Prev</button>
                <button x-carousel:next-trigger>Next</button>
              </div>

              <div x-carousel:item-group>
                {carouselData.map((image, index) => (
                  <div x-carousel:item={`{index: ${index}}`}>
                    <img src={image} alt="" width="188px" />
                  </div>
                ))}
              </div>
              <div x-carousel:indicator-group>
                <template x-for="(_, index) in $carousel().pageSnapPoints" x-bind:key="index">
                  <button x-carousel:indicator="{ index }" />
                </template>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={carouselControls} slot="controls" />
            <StateVisualizer label="carousel" omit={["translations"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
