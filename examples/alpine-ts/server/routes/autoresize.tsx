import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/autoresize.ts"></script>
      </Head>

      <body>
        <div class="page">
          <Nav pathname={event.url.pathname} />

          <main>
            <textarea
              x-data
              x-ref="textarea"
              x-init="() => $autoresizeTextarea($refs.textarea)"
              rows={4}
              style={{
                width: "100%",
                resize: "none",
                padding: 20,
                scrollPaddingBlock: 20,
                maxHeight: 180,
              }}
            />
          </main>
        </div>
      </body>
    </html>
  )
})
