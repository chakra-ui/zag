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
        <div
          ref={scrollRef}
          data-testid="scroll-container"
          style={{
            border: "1px solid hsl(219, 1%, 72%)",
            borderRadius: "4px",
            height: "24rem",
            overflow: "auto",
            padding: "1rem",
          }}
        >
          <div {...api.getRootProps()}>
            <nav
              {...api.getNavProps()}
              style={{ position: "sticky", top: 0, alignSelf: "flex-start", maxHeight: "8rem" }}
            >
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
              {tocData.map((item) => (
                <div key={item.value} style={{ marginBottom: "1rem" }}>
                  <h2 id={item.value} style={{ fontSize: item.depth === 2 ? "1.25rem" : "1rem" }}>
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
            </section>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
