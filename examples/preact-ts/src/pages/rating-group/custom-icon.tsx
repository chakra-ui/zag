import { normalizeProps, useMachine } from "@zag-js/preact"
import * as rating from "@zag-js/rating-group"
import { HeartIcon } from "lucide-preact"
import type { CSSProperties } from "preact"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const service = useMachine(rating.machine, {
    id: useId(),
    defaultValue: 3,
  })

  const api = rating.connect(service, normalizeProps)

  return (
    <>
      <main className="rating">
        <div {...api.getRootProps()} style={{ "--rating-color": "var(--z-red-500)" } as CSSProperties}>
          <label {...api.getLabelProps()}>How much do you love it?</label>
          <div {...api.getControlProps()}>
            {api.items.map((index) => (
              <span key={index} {...api.getItemProps({ index })}>
                <HeartIcon fill="currentColor" strokeWidth={0} />
              </span>
            ))}
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
