import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { HeartIcon } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const service = useMachine(rating.machine, {
    id: createUniqueId(),
    defaultValue: 3,
  })

  const api = createMemo(() => rating.connect(service, normalizeProps))

  return (
    <>
      <main class="rating">
        <div {...api().getRootProps()} style={{ "--rating-color": "var(--z-red-500)" }}>
          <label {...api().getLabelProps()}>How much do you love it?</label>
          <div {...api().getControlProps()}>
            <For keyed={false} each={api().items}>
              {(index) => (
                <span {...api().getItemProps({ index: index() })}>
                  <HeartIcon fill="currentColor" stroke-width={0} />
                </span>
              )}
            </For>
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
