import * as dialog from "@zag-js/dialog"
import * as hoverCard from "@zag-js/hover-card"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/hover-card.css"
import "@styles/dialog.css"

function HoverCard(props: { container: HTMLElement }) {
  const service = useMachine(hoverCard.machine, { id: createUniqueId() })
  const api = createMemo(() => hoverCard.connect(service, normalizeProps))
  return (
    <>
      <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" {...api().getTriggerProps()}>
        Twitter
      </a>
      <Show when={api().open}>
        <Portal mount={props.container}>
          <div {...api().getPositionerProps()}>
            <div {...mergeProps(api().getContentProps(), { style: { width: "200px", height: "200px" } })}>
              <div {...api().getArrowProps()}>
                <div {...api().getArrowTipProps()} />
              </div>
              Twitter Preview
              <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">
                Twitter
              </a>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: createUniqueId(), initialFocusEl: null })
  const api = createMemo(() => dialog.connect(service, normalizeProps))
  const [contentEl, setContentEl] = createSignal<HTMLDivElement>()
  return (
    <div style={{ padding: "20px" }}>
      <button {...api().getTriggerProps()} data-testid="trigger-1">
        Open Dialog
      </button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div data-testid="positioner-1" {...api().getPositionerProps()}>
            <div
              ref={setContentEl}
              {...mergeProps(api().getContentProps(), { style: { width: "400px", height: "400px" } })}
            >
              <Show when={contentEl()}>{(el) => <HoverCard container={el()} />}</Show>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  )
}
