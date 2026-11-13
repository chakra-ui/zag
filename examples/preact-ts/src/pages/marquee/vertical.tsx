import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { marqueeTestimonials } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/marquee.css"

export default function Page() {
  const service = useMachine(marquee.machine, {
    id: useId(),
    side: "bottom",
    pauseOnInteraction: true,
  })

  const api = marquee.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="testimonials">
          <div {...api.getRootProps()}>
            <div {...api.getEdgeProps({ side: "top" })} />

            <div {...api.getViewportProps()}>
              {Array.from({ length: api.contentCount }).map((_, index) => (
                <div key={index} {...api.getContentProps({ index })}>
                  {marqueeTestimonials.map((item) => (
                    <figure key={item.name} {...api.getItemProps()}>
                      <blockquote className="quote">{item.quote}</blockquote>
                      <figcaption className="author">
                        <strong>{item.name}</strong>
                        <span>{item.role}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>

            <div {...api.getEdgeProps({ side: "bottom" })} />
          </div>
          <p className="hint">Hover a testimonial to pause the scroll.</p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
