import { defineHandler } from "nitro/h3"
import { getControlDefaults, ratingControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

function HalfStar() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
        fill="#bdbdbd"
      />
    </svg>
  )
}

function Star() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default defineHandler((event) => {
  const state = getControlDefaults(ratingControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/rating-group.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['rating']"
          x-rating={`{id: $id('rating'), defaultValue: 2.5, ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="rating">
            <form action="">
              <div x-rating:root>
                <label x-rating:label>Rate:</label>
                <div x-rating:control>
                  <template x-for="index in $rating().items" x-bind:key="index">
                    <span x-rating:item="{ index }">
                      <template x-if="$rating().getItemState({ index }).half">
                        <HalfStar />
                      </template>
                      <template x-if="! $rating().getItemState({ index }).half">
                        <Star />
                      </template>
                    </span>
                  </template>
                </div>
                <input x-rating:hidden-input data-testid="hidden-input" />
              </div>
              <button type="reset">Reset</button>
            </form>
          </main>

          <Toolbar>
            <Controls config={ratingControls} state={state} slot="controls" />
            <StateVisualizer label="rating" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
