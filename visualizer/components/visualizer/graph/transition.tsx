import type { Point } from "@zag-js/rect-utils"
import { DirectedGraphEdge } from "../utils/graph/create-graph"
import { dataAttr } from "@zag-js/dom-query"
import { useSimulation } from "../simulation/context"
import { Action } from "./action"
import { getNextEvents } from "../utils/machine/misc"
import { parseGuardCondition } from "../utils/machine/parse-guard"
import { isStateNodeActive } from "../utils/machine/state-node"

export const Transition: React.FC<{
  edge: DirectedGraphEdge
  position?: Point
}> = ({ edge, position }) => {
  const { service, child } = useSimulation()

  const machine = service.refs.get("machine")
  if (!machine) return null
  const machineState = child.state.get()

  const nextEvents = getNextEvents(machine, machineState)

  const isPossibleTransition = nextEvents.includes(edge.transition.eventType)

  const sourceIsActive = isStateNodeActive(edge.source, machine.id, machineState)
  const isPotential = isPossibleTransition && sourceIsActive

  return (
    <button
      data-part="transition"
      data-potential={dataAttr(isPotential)}
      data-disabled={dataAttr(!isPossibleTransition)}
      disabled={!isPossibleTransition}
      data-rect-id={edge.id}
      style={{
        position: "absolute",
        ...(position && {
          left: `${position.x}px`,
          top: `${position.y}px`,
        }),
      }}
      onMouseEnter={() => {
        if (!isPotential) return
        service.send({
          type: "PREVIEW_EVENT",
          eventType: edge.transition.eventType,
        })
      }}
      onMouseLeave={() => {
        service.send({
          type: "UNPREVIEW_EVENT",
        })
      }}
      onClick={() => {
        if (!isPossibleTransition) return
        service.send({
          type: "CHILD_TRANSITION",
          eventType: edge.transition.eventType,
        })
      }}
    >
      <div data-part="transition-label">
        <span data-part="transition-event">
          <div data-part="event-type">
            <div data-part="event-type-text">{edge.transition.eventType}</div>
          </div>
        </span>
        {edge.transition.condition && (
          <span
            data-part="transition-guard"
            dangerouslySetInnerHTML={{
              __html: parseGuardCondition(edge.transition.condition),
            }}
          />
        )}
      </div>
      <div data-part="transition-content">
        {edge.transition.actions && edge.transition.actions.length > 0 && (
          <div data-part="transition-actions">
            {edge.transition.actions.map((action, index) => {
              return <Action key={index} action={action} kind="do" />
            })}
          </div>
        )}
      </div>
    </button>
  )
}
