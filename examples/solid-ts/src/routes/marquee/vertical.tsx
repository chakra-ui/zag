import * as marquee from "@zag-js/marquee"
import { marqueeTestimonials } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const service = useMachine(marquee.machine, {
    id: createUniqueId(),
    side: "bottom",
    pauseOnInteraction: true,
  })

  const api = createMemo(() => marquee.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="testimonials">
          <div {...api().getRootProps()}>
            <div {...api().getEdgeProps({ side: "top" })} />

            <div {...api().getViewportProps()}>
              <For keyed={false} each={Array.from({ length: api().contentCount })}>
                {(_, index) => (
                  <div {...api().getContentProps({ index })}>
                    <For each={marqueeTestimonials}>
                      {(item) => (
                        <figure {...api().getItemProps()}>
                          <blockquote class="quote">{item.quote}</blockquote>
                          <figcaption class="author">
                            <strong>{item.name}</strong>
                            <span>{item.role}</span>
                          </figcaption>
                        </figure>
                      )}
                    </For>
                  </div>
                )}
              </For>
            </div>

            <div {...api().getEdgeProps({ side: "bottom" })} />
          </div>
          <p class="hint">Hover a testimonial to pause the scroll.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
