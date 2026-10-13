import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For, Index } from "solid-js"
import { Star } from "~/components/rating-icons"
import "@styles/rating-group.css"

const sizes = [
  { label: "Small", size: "16px" },
  { label: "Medium", size: "24px" },
  { label: "Large", size: "32px" },
]

function SizedRating(props: { label: string; size: string }) {
  const service = useMachine(rating.machine, {
    id: createUniqueId(),
    defaultValue: 3,
  })

  const api = createMemo(() => rating.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()} style={{ "--rating-size": props.size }}>
      <label {...api().getLabelProps()}>{props.label}</label>
      <div {...api().getControlProps()}>
        <Index each={api().items}>
          {(index) => (
            <span {...api().getItemProps({ index: index() })}>
              <Star />
            </span>
          )}
        </Index>
      </div>
      <input {...api().getHiddenInputProps()} />
    </div>
  )
}

export default function Page() {
  return (
    <main class="rating">
      <div class="vstack gap-5">
        <For each={sizes}>{(item) => <SizedRating label={item.label} size={item.size} />}</For>
      </div>
    </main>
  )
}
