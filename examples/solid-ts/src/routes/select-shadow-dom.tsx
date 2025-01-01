import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import styles from "@zag-js/shared/src/style.css?inline"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId, splitProps } from "solid-js"
import { Portal } from "solid-js/web"

function Select(props: Partial<select.Context> & { portalRef?: HTMLElement }) {
  const [portalProps, machineProps] = splitProps(props, ["portalRef"])

  const [state, send] = useMachine(
    select.machine({
      ...machineProps,
      collection: select.collection({ items: selectData }),
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => select.connect(state, send, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <button {...api().getTriggerProps()}>
          {api().valueAsString || "Select option"}
          <span {...api().getIndicatorProps()}>▼</span>
        </button>
      </div>
      <Portal mount={portalProps.portalRef}>
        <div {...api().getPositionerProps()}>
          <ul {...api().getContentProps()}>
            <Index each={selectData}>
              {(item) => (
                <li {...api().getItemProps({ item: item() })}>
                  <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                  <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                </li>
              )}
            </Index>
          </ul>
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  let mountRef!: HTMLElement
  const [shadowRef, setShadowRef] = createSignal<HTMLDivElement | null>(null)
  const getRootNode = () => shadowRef()?.shadowRoot!

  return (
    <main class="select" ref={mountRef}>
      <Select />
      <div style={{ height: "50vh" }} />
      <Portal ref={setShadowRef} useShadow mount={mountRef}>
        <style>{styles}</style>
        <Select getRootNode={getRootNode} portalRef={getRootNode()?.getElementById("portal-root")!} />
        <div id="portal-root" />
      </Portal>
    </main>
  )
}
