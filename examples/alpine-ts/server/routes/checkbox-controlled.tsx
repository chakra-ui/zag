import { defineHandler } from "nitro/deps/h3"
import { Head } from "../components/head"
import { Nav } from "../components/nav"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/checkbox.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{checked: false}"
          x-id="['checkbox']"
          x-checkbox="{
            id: $id('checkbox'),
            name: 'checkbox',
            checked,
            onCheckedChange(details) {
              checked = !!details.checked
            },
          }"
        >
          <Nav pathname={event.url.pathname} />

          <main class="checkbox">
            <label x-checkbox:root>
              <div x-checkbox:control />
              <span x-checkbox:label x-text="'Input ' + ($checkbox.checked ? 'Checked' : 'Unchecked')"></span>
              <input x-checkbox:hidden-input data-testid="hidden-input" />
              <div x-checkbox:indicator>Indicator</div>
            </label>

            <button type="button" x-bind:disabled="$checkbox.checked" x-on:click="$checkbox.setChecked(true)">
              Check
            </button>
            <button type="button" x-bind:disabled="! $checkbox.checked" x-on:click="$checkbox.setChecked(false)">
              Uncheck
            </button>
            <button type="reset">Reset Form</button>
          </main>
        </div>
      </body>
    </html>
  )
})
