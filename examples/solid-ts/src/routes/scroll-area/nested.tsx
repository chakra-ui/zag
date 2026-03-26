import styles from "../../../../../shared/src/css/scroll-area.module.css"
import * as scrollArea from "@zag-js/scroll-area"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For, type JSX } from "solid-js"

function ScrollArea(props: { children: JSX.Element; style?: JSX.CSSProperties }) {
  const service = useMachine(scrollArea.machine, {
    id: createUniqueId(),
  })

  const api = createMemo(() => scrollArea.connect(service, normalizeProps))

  return (
    <div {...mergeProps(api().getRootProps(), { style: props.style })}>
      <div {...api().getViewportProps()} class={styles.Viewport}>
        <div {...api().getContentProps()} class={styles.Content}>{props.children}</div>
      </div>
      {api().hasOverflowY && (
        <div {...api().getScrollbarProps()} class={styles.Scrollbar}>
          <div {...api().getThumbProps()} class={styles.Thumb} />
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <main class="scroll-area">
      <ScrollArea style={{ height: "500px", width: "800px" }}>
        <For each={Array.from({ length: 5 })}>
          {() => (
            <ScrollArea style={{ "max-height": "200px" }}>
              <For each={Array.from({ length: 100 })}>{(_, index) => <div>{index()}</div>}</For>
            </ScrollArea>
          )}
        </For>
      </ScrollArea>
    </main>
  )
}
