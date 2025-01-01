import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import styles from "@zag-js/shared/src/style.css?inline"
import { createMemo, createSignal, Show } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  let mountRef!: HTMLElement
  const [shadowRef, setShadowRef] = createSignal<HTMLDivElement | null>(null)

  const getRootNode = () => shadowRef()?.shadowRoot!

  const [state, send] = useMachine(tooltip.machine({ id: "1", getRootNode }))
  const api = createMemo(() => tooltip.connect(state, send, normalizeProps))

  return (
    <main ref={mountRef}>
      <p>Testing</p>
      <Portal ref={setShadowRef} useShadow mount={mountRef}>
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
    </main>
  )
}
