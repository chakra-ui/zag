import { dataAttr } from "@zag-js/dom-query"
import { DirectedGraphNode } from "../../utils/graph/create-graph"
import { useSimulation } from "../../simulation/context"
import { useMemo } from "react"
import { getNextTransitions } from "../../utils/machine/misc"
import { isStateNodeActive } from "../../utils/machine/state-node"
import { StateNodeHeader } from "./header"
import { StateNodeActions } from "./actions"
import { getLayoutStyles } from "./layout"

export const StateNode: React.FC<{
  node: DirectedGraphNode
}> = ({ node }) => {
  const { service, child } = useSimulation()
  const machine = service.refs.get("machine")
  const machineState = child.state.get()
  const stateNode = node.data

  const isActiveStateNode = machine && isStateNodeActive(stateNode, machine.id, machineState)

  const previewedEvent = service?.context.get("previewedEvent")
  const isPreviewedState = useMemo(() => {
    if (!previewedEvent || !machine) return false
    const possibleTransitions = getNextTransitions(machine, machineState, previewedEvent)

    return possibleTransitions.some((t) => t.target === stateNode)
  }, [previewedEvent, machine, machineState, stateNode])

  const layout = useMemo(() => getLayoutStyles(node.layout), [node.layout])

  return (
    <div
      data-part="state-node-group"
      data-active={dataAttr(isActiveStateNode)}
      data-previewed={dataAttr(isPreviewedState)}
      style={{ position: "absolute", ...layout.position }}
    >
      <div
        data-part="state-node"
        data-type={stateNode.type}
        data-parent-type={stateNode.parent?.type}
        data-atomic={dataAttr(stateNode.type === "atomic")}
        data-rect-id={stateNode.id}
        style={layout.dimensions}
      >
        <div
          data-part="state-node-content"
          data-atomic={dataAttr(stateNode.type === "atomic")}
          data-rect-id={`${stateNode.id}:content`}
        >
          <StateNodeHeader value={stateNode.key} tags={stateNode.tags} />

          <StateNodeActions node={stateNode} kind="effect" />
          <StateNodeActions node={stateNode} kind="entry" />
          <StateNodeActions node={stateNode} kind="exit" />
        </div>

        {"states" in stateNode && (
          <div data-part="state-node-states">
            {node.children.map((childNode) => (
              <StateNode key={childNode.id} node={childNode} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
