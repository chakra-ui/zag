import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ChevronsUpDownIcon } from "lucide-solid"
import keyframes from "@styles/keyframes.css?inline"
import selectStyles from "@styles/select.css?inline"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId, omit, Show } from "solid-js"
import { Portal } from "@solidjs/web"
import "@styles/select.css"

const styles = keyframes + selectStyles

function Select(props: Partial<select.Props> & { portalRef?: HTMLElement }) {
  const machineProps = omit(props, "portalRef")

  const service = useMachine(select.machine, {
    ...machineProps,
    collection: select.collection({ items: selectData }),
    id: createUniqueId(),
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getControlProps()}>
        <button {...api().getTriggerProps()}>
          {api().valueAsString || "Select option"}
          <span {...api().getIndicatorProps()}>
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>
      <Portal mount={props.portalRef}>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For keyed={false} each={selectData}>
                {(item) => (
                  <div {...api().getItemProps({ item: item() })}>
                    <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                    <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </Portal>
    </div>
  )
}

export default function Page() {
  const [shadowRoot, setShadowRoot] = createSignal<ShadowRoot | null>(null)
  const getRootNode = () => shadowRoot()!

  return (
    <main class="select">
      <Select />
      <div style={{ height: "50vh" }} />
      <div ref={(el) => setShadowRoot(el.attachShadow({ mode: "open" }))} />
      <Show when={shadowRoot()}>
        {(root) => (
          <Portal mount={root() as unknown as Element}>
            <style>{styles}</style>
            <Select getRootNode={getRootNode} portalRef={getRootNode()?.getElementById("portal-root")!} />
            <div id="portal-root" />
          </Portal>
        )}
      </Show>
    </main>
  )
}
