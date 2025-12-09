import { defineHandler } from "nitro/h3"
import { Bold } from "lucide-static"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/toggle.ts"></script>
      </Head>

      <body>
        <div class="page" x-data x-toggle="{}">
          <Nav pathname={event.url.pathname} />

          <main class="toggle">
            <button x-toggle:root>
              <span x-toggle:indicator>{html(Bold)}</span>
            </button>
          </main>

          <Toolbar viz>
            <StateVisualizer label="toggle" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
