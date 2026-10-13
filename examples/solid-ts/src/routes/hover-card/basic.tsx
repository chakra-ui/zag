import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/hover-card.css"

export default function Page() {
  const controls = useControls(hoverCardControls)

  const service = useMachine(hoverCard.machine, controls.mergeProps<hoverCard.Props>({ id: createUniqueId() }))

  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <>
      <main class="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api().getTriggerProps()}>
            @zag_js
          </a>
          <Show when={api().open}>
            <Portal>
              <div {...api().getPositionerProps()}>
                <div {...api().getContentProps()}>
                  <div {...api().getArrowProps()}>
                    <div {...api().getArrowTipProps()} />
                  </div>
                  <div class="profile">
                    <span class="profile-avatar" aria-hidden="true">
                      Z
                    </span>
                    <div class="profile-body">
                      <span class="profile-name">Zag.js</span>
                      <span class="profile-handle">@zag_js</span>
                      <p class="profile-bio">
                        UI components powered by finite state machines. Works with React, Solid, Vue and Svelte.
                      </p>
                      <a class="profile-meta" href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                        twitter.com/zag_js
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Portal>
          </Show>
          <div data-part="test-text">Test text</div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
