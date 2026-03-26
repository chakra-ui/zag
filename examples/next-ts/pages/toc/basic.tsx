import { normalizeProps, useMachine } from "@zag-js/react"
import { tocControls, tocData } from "@zag-js/shared"
import * as toc from "@zag-js/toc"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(tocControls)

  const service = useMachine(toc.machine, {
    id: useId(),
    items: tocData,
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
              {tocData.map((item) => (
                <li key={item.value} {...api.getItemProps({ item })}>
                  <a href={`#${item.value}`} {...api.getLinkProps({ item })}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div style={{ maxHeight: "20rem", overflow: "auto", flex: 1 }}>
            {tocData.map((item) => (
              <div key={item.value} style={{ marginBottom: "1rem" }}>
                <h2 id={item.value} style={{ fontSize: item.depth === 2 ? "1.25rem" : "1rem" }}>
                  {item.label}
                </h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
