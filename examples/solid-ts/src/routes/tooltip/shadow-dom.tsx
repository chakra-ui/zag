import styles from "../../../../../shared/src/css/tooltip.module.css"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import keyframesStyles from "../../../../../shared/src/css/keyframes.module.css?inline"
import layoutStyles from "../../../../../shared/src/css/layout.module.css?inline"
import componentStyles from "../../../../../shared/src/css/tooltip.module.css?inline"
import { createMemo, createSignal, Show } from "solid-js"
import { Portal } from "solid-js/web"

const styles = [keyframesStyles, layoutStyles, componentStyles].join("\n")

export default function Page() {
  let mountRef!: HTMLElement
  const [shadowRef, setShadowRef] = createSignal<HTMLDivElement | null>(null)

  const getRootNode = () => shadowRef()?.shadowRoot!

  const service = useMachine(tooltip.machine, { id: "1", getRootNode })
  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  return (
    <main ref={mountRef}>
      <p>Testing</p>
      <Portal ref={setShadowRef} useShadow mount={mountRef}>
        <style>{styles}</style>
        <button {...api().getTriggerProps()}>Hover me</button>
        <Show when={api().open}>
          <Portal mount={getRootNode()?.getElementById("portal-root")!}>
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()} class={styles.Content}>Tooltip</div>
            </div>
          </Portal>
        </Show>
        <div id="portal-root" />
      </Portal>
    </main>
  )
}
