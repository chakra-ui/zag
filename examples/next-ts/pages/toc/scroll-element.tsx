import { normalizeProps, useMachine } from "@zag-js/react"
import { tocControls, tocData } from "@zag-js/shared"
import * as toc from "@zag-js/toc"
import { useId, useRef } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(tocControls)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const service = useMachine(toc.machine, {
    id: useId(),
    items: tocData,
    scrollEl: () => scrollRef.current,
    ...controls.context,
  })

  const api = toc.connect(service, normalizeProps)

  return (
    <>
      <main className="toc">
        <div style={{ display: "flex", gap: "2rem" }}>
          <nav {...api.getRootProps()}>
            <h5 {...api.getTitleProps()}>On this page</h5>
            <ul {...api.getListProps()}>
              <div {...api.getIndicatorProps()} />
              {tocData.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })}>
                  <a href={`#${item.value}`} {...api.getLinkProps({ item })}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <section style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <button type="button" onClick={() => api.scrollTo("installation", { behavior: "instant" })}>
                Installation
              </button>
              <button type="button" onClick={() => api.scrollTo("api-reference", { behavior: "smooth" })}>
                API Reference
              </button>
            </div>

            <div
              ref={scrollRef}
              style={{
                border: "1px solid hsl(219, 1%, 72%)",
                borderRadius: "4px",
                flex: 1,
                maxHeight: "20rem",
                overflow: "auto",
                padding: "1rem",
                scrollPaddingBlockStart: "1rem",
              }}
            >
              {tocData.map((item) => (
                <div key={item.value} style={{ marginBottom: "1rem" }}>
                  <h2
                    id={item.value}
                    style={{
                      fontSize: item.depth === 2 ? "1.25rem" : "1rem",
                      scrollMarginBlockStart: "0.5rem",
                    }}
                  >
                    {item.label}
                  </h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                    pariatur. Excepteur sint occaecat cupidatat non proident.
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
