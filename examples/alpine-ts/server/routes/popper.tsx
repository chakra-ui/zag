import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/popper.ts"></script>
      </Head>

      <body>
        <div class="page">
          <Nav pathname={event.url.pathname} />

          <div
            x-data="{positioned: {}}"
            x-init="$getPlacement($refs.reference, $refs.floating, {
              placement: 'right-start',
              onComplete(data) {
                positioned = data
              },
            })"
          >
            <button x-ref="reference">Hello StackBlitz!</button>
            <div x-bind:style="$getPlacementStyles(positioned).floating" x-ref="floating">
              Start editing to see some magic happen :)
            </div>
          </div>
        </div>
      </body>
    </html>
  )
})
