import { tocControls, tocData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toc from "@zag-js/toc"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(tocControls)

  const service = useMachine(
    toc.machine,
    controls.mergeProps<toc.Props>({
      id: createUniqueId(),
      items: tocData,
    }),
  )

  const api = createMemo(() => toc.connect(service, normalizeProps))

  return (
    <>
      <main class="toc">
        <div style={{ display: "flex", gap: "2rem" }}>
          <nav {...api().getRootProps()}>
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

          <div style={{ "max-height": "20rem", overflow: "auto", flex: "1" }}>
            <For each={tocData}>
              {(item) => (
                <div style={{ "margin-bottom": "1rem" }}>
                  <h2 id={item.value} style={{ "font-size": item.depth === 2 ? "1.25rem" : "1rem" }}>
                    {item.label}
                  </h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                  </p>
                </div>
              )}
            </For>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
