import { defineHandler } from "nitro/h3"
import { getControlDefaults, passwordInputControls } from "@zag-js/shared"
import { Controls } from "../components/controls"
import { Head } from "../components/head"
import { Nav } from "../components/nav"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineHandler((event) => {
  const state = getControlDefaults(passwordInputControls)

  return (
    <html>
      <Head>
        <script type="module" src="/scripts/password-input.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data={JSON.stringify(state)}
          x-id="['password-input']"
          x-password-input={`{id: $id('password-input'), ${Object.keys(state)}}`}
        >
          <Nav pathname={event.url.pathname} />

          <main class="password-input">
            <div x-password-input:root>
              <label x-password-input:label>Password</label>
              <div x-password-input:control>
                <input x-password-input:input />
                <button x-password-input:visibility-trigger>
                  <span x-password-input:indicator x-html="$passwordInput().visible ? $EyeIcon : $EyeOffIcon"></span>
                </button>
              </div>
            </div>
          </main>

          <Toolbar>
            <Controls config={passwordInputControls} state={state} slot="controls" />
            <StateVisualizer label="password-input" />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
