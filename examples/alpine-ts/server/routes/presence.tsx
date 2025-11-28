import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/presence.ts"></script>
      </Head>

      <body>
        <div class="page" x-data="{present: false}" x-presence="{present}">
          <Nav pathname={event.url.pathname} />

          <main class="presence">
            <button x-on:click="present = ! present">Toggle</button>
            <template x-if="$presence().present">
              <div
                x-ref="presence"
                x-init="$presence().setNode($refs.presence)"
                data-scope="presence"
                data-state="$presence().skip ? undefined : present ? 'open' : 'closed'"
              >
                Content
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})
