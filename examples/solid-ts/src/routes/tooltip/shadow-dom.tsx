import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import keyframes from "@styles/keyframes.css?inline"
import tooltipStyles from "@styles/tooltip.css?inline"
import { createMemo, createSignal, Show } from "solid-js"
import { Portal } from "@solidjs/web"
import "@styles/tooltip.css"

const styles = keyframes + tooltipStyles

export default function Page() {
  const [shadowRoot, setShadowRoot] = createSignal<ShadowRoot | null>(null)

  const getRootNode = () => shadowRoot()!

  const service = useMachine(tooltip.machine, { id: "1", getRootNode })
  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <main>
      <p>Testing</p>
      <div ref={(el) => setShadowRoot(el.attachShadow({ mode: "open" }))} />
      <Show when={shadowRoot()}>
        {(root) => (
          <Portal mount={root() as unknown as Element}>
            <style>{styles}</style>
            <button {...api().getTriggerProps()}>Hover me</button>
            <Show when={api().open}>
              <Portal mount={getRootNode()?.getElementById("portal-root")!}>
                <div {...api().getPositionerProps()}>
                  <div {...api().getContentProps()}>Tooltip</div>
                </div>
              </Portal>
            </Show>
            <div id="portal-root" />
          </Portal>
        )}
      </Show>
    </main>
  )
}
