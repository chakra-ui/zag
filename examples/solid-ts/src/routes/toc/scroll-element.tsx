import { tocControls, tocData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toc from "@zag-js/toc"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/toc.css"

export default function Page() {
  const controls = useControls(tocControls)
  let scrollRef: HTMLDivElement | undefined

  const service = useMachine(
    toc.machine,
    controls.mergeProps<toc.Props>({
      id: createUniqueId(),
      items: tocData,
      scrollEl: () => scrollRef ?? null,
    }),
  )

  const api = createMemo(() => toc.connect(service, normalizeProps))

  return (
    <>
      <main class="toc">
        <div {...api().getRootProps()}>
          <nav {...api().getNavProps()}>
            <h5 {...api().getTitleProps()}>On this page</h5>
            <ul {...api().getListProps()}>
              <div {...api().getIndicatorProps()} />
              <For each={tocData}>
                {(item) => (
                  <li {...api().getItemProps({ item })}>
                    <a href={`#${item.value}`} {...api().getLinkProps({ item })}>
                      {item.label}
                    </a>
                  </li>
                )}
              </For>
            </ul>
          </nav>

          <section style={{ flex: 1, "min-width": 0 }}>
            <div style={{ display: "flex", gap: "0.5rem", "margin-bottom": "0.75rem" }}>
              <button type="button" onClick={() => api().scrollTo("installation", { behavior: "instant" })}>
                Installation
              </button>
              <button type="button" onClick={() => api().scrollTo("api-reference", { behavior: "smooth" })}>
                API Reference
              </button>
            </div>

            <div
              ref={scrollRef}
              style={{
                border: "1px solid hsl(219, 1%, 72%)",
                "border-radius": "4px",
                flex: 1,
                "max-height": "20rem",
                overflow: "auto",
                padding: "1rem",
                "scroll-padding-block-start": "1rem",
              }}
            >
              <For each={tocData}>
                {(item) => (
                  <div style={{ "margin-bottom": "1rem" }}>
                    <h2
                      id={item.value}
                      style={{
                        "font-size": item.depth === 2 ? "1.25rem" : "1rem",
                        "scroll-margin-block-start": "0.5rem",
                      }}
                    >
                      {item.label}
                    </h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <p>
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident.
                    </p>
                  </div>
                )}
              </For>
            </div>
          </section>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
