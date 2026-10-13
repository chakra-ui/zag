import * as collapsible from "@zag-js/collapsible"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Show, type JSX } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/collapsible.css"

interface CollapsibleProps {
  trigger: JSX.Element
  children: JSX.Element
  debug?: boolean
  open?: boolean
}

function Collapsible(props: CollapsibleProps) {
  const id = createUniqueId()
  const service = useMachine(collapsible.machine, () => ({ id, open: props.open }))
  const api = createMemo(() => collapsible.connect(service, normalizeProps))
  const contentProps = createMemo(() => mergeProps(api().getContentProps(), { style: { background: "red" } }))
  return (
    <>
      <div {...api().getRootProps()}>
        <button {...api().getTriggerProps()}>{props.trigger}</button>
        <div {...contentProps()}>{props.children}</div>
      </div>
      <Show when={props.debug}>
        <div style={{ position: "fixed", top: 0, right: 0 }}>
          <Toolbar viz>
            <StateVisualizer state={service} omit={["stylesRef"]} />
          </Toolbar>
        </div>
      </Show>
    </>
  )
}

export default function Page() {
  return (
    <main>
      <Collapsible trigger="Collapsible Depth 1" debug>
        <p>
          Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
          magna sfsd. Ut enim ad minimdfd v eniam
        </p>
        <Collapsible trigger="Sibling 1 / Collapsible Depth 2">
          <p>
            Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna sfsd. Ut enim ad minimdfd v eniam
          </p>
          <Collapsible trigger="Collapsible Depth 3">
            <p>
              Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna sfsd. Ut enim ad minimdfd v eniam
            </p>
            <Collapsible trigger="Collapsible Depth 4">
              <p>
                Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna sfsd. Ut enim ad minimdfd.
              </p>
              <Collapsible trigger="Collapsible Depth 5">
                <p>
                  Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna sfsd. Ut enim ad minimdfd v eniam
                </p>
              </Collapsible>
            </Collapsible>
          </Collapsible>
        </Collapsible>

        <Collapsible trigger="Sibling 2">
          <p>
            Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
            magna sfsd. Ut enim ad minimdfd v eniam
          </p>
        </Collapsible>
      </Collapsible>
    </main>
  )
}
