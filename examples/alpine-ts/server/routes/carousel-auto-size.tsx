import { defineHandler } from "nitro/h3"
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
          x-data
          x-carousel={`{
            id: $id('carousel'),
            autoSize: true,
            spacing: '16px',
            slideCount: $variableWidthData.length,
            allowMouseDrag: true,
            snapType: 'mandatory',
          }`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="carousel-auto-size">
            <div x-carousel:root>
              <h2>Auto Size Carousel</h2>
              <p>Each slide has a different size based on its content.</p>

              <div x-carousel:control>
                <button x-carousel:autoplay-trigger x-text="$carousel().isPlaying ? 'Stop' : 'Play'"></button>
                <div class="carousel-spacer" />
                <button x-carousel:prev-trigger>← Prev</button>
                <button x-carousel:next-trigger>Next →</button>
              </div>

              <div x-carousel:item-group>
                <template x-for="(slide, index) in $variableWidthData" x-bind:key="index">
                  <div
                    x-carousel:item="{ index }"
                    x-bind:style="{
                      ...$carousel().getItemProps({index, snapAlign: 'center'}).style,
                      minHeight: '120px',
                      backgroundColor: slide.color,
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      padding: '16px',
                      boxSizing: 'border-box',
                    }"
                    x-text="slide.content"
                  ></div>
                </template>
              </div>

              <div x-carousel:indicator-group>
                <template x-for="(_, index) in $variableWidthData" x-bind:key="index">
                  <button
                    x-carousel:indicator="{ index }"
                    x-bind:style="{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === $carousel().page ? '#333' : '#ccc',
                      margin: '0 4px',
                      cursor: 'pointer',
                    }"
                  />
                </template>
              </div>

              <div x-caraousel:progress-text x-text="$carousel().getProgressText()"></div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <h3>Comparison: Fixed Width Carousel</h3>
              <FixedWidthExample />
            </div>
          </main>

          <Toolbar controls={false}>
            <StateVisualizer label="carousel" omit={["translations"]} />
          </Toolbar>
        </div>
      </body>

      <style>{`
        .carousel-auto-size {
          padding: 32px;
          max-width: 800px;
          margin: 0 auto;
        }

        .carousel-spacer {
          flex: 1;
        }

        h2 {
          margin-bottom: 8px;
        }

        p {
          margin-bottom: 24px;
          color: #666;
        }
      `}</style>
    </html>
  )
})

function FixedWidthExample() {
  return (
    <div
      x-id="['carousel']"
      {...{
        "x-carousel.fixed": `{
          id: $id('carousel'),
          autoSize: false,
          spacing: '16px',
          slidesPerPage: 2,
          slideCount: $variableWidthData.length,
          allowMouseDrag: true,
        }`,
        "x-carousel:root.fixed": true,
      }}
    >
      <div {...{ "x-carousel:control.fixed": true }}>
        <button {...{ "x-carousel:prev-trigger.fixed": true }}>← Prev</button>
        <div class="carousel-spacer" />
        <button {...{ "x-carousel:next-trigger.fixed": true }}>Next →</button>
      </div>

      <div {...{ "x-carousel:item-group.fixed": true }}>
        <template x-for="(slide, index) in $variableWidthData" x-bind:key="index">
          <div
            {...{ "x-carousel:item.fixed": "{ index }" }}
            x-bind:style="{
              minHeight: '120px',
              backgroundColor: slide.color,
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '16px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }"
            x-text="slide.content"
          ></div>
        </template>
      </div>

      <div {...{ "x-carousel:indicator-group.fixed": true }}>
        <template x-for="(_, index) in $carousel('fixed').pageSnapPoints" x-bind:key="index">
          <button
            {...{ "x-carousel:indicator.fixed": "{ index }" }}
            x-bind:style="{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: index === $carousel('fixed').page ? '#333' : '#ccc',
              margin: '0 4px',
              cursor: 'pointer',
            }"
          />
        </template>
      </div>
    </div>
  )
}
