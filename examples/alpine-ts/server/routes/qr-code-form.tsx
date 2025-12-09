import { defineHandler } from "nitro/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/qr-code.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{url: '', image: ''}"
          x-id="['qr-code']"
          x-qr-code="{id: $id('qr-code'), encoding: {ecc: 'H'}, value: url}"
        >
          <Nav pathname={event.url.pathname} />

          <main class="qr-code">
            <form
              x-on:submit="(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const u = formData.get('url')?.toString()
                if (u) url = u
              }"
            >
              <input type="text" name="url" />
              <button type="submit">Generate</button>
            </form>

            <template x-if="url">
              <div x-qr-code:root>
                <svg x-qr-code:frame>
                  <path x-qr-code:pattern />
                </svg>
              </div>
            </template>

            <button x-on:click="$qrCode().getDataUrl('image/jpeg').then((i) => image = i)">Preview</button>
            <template x-if="image">
              <img x-bind:src="image" alt="QR Code" height={120} width={120} />
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})
