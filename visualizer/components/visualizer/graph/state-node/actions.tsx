import { useMemo } from "react"
import type { StateNode } from "../../utils/graph/types"
import { isConditionalActions, formatConditionalActions } from "../../utils/machine/state-node"
import { ELSE_GUARD } from "../../utils/machine/serialize"
import { Action } from "../action"

interface ConditionalActionsProps {
  node: StateNode
  kind: "entry" | "exit" | "effect"
}

export const StateNodeActions: React.FC<ConditionalActionsProps> = ({ node, kind }) => {
  const actions = node.definition[kind]
  const formattedActions = useMemo(
    () => (actions && isConditionalActions(actions) ? formatConditionalActions(actions) : null),
    [actions],
  )

  if (!actions) return null

  if (isConditionalActions(actions)) {
    return (
      <div data-part="state-node-actions" data-part-actions={kind}>
        {formattedActions!.map(([condition, actionList]) => (
          <div key={`${node.id}-${kind}-${condition}`}>
            <span data-part="state-node-action-condition">
              {condition !== ELSE_GUARD ? `if(${condition})` : "else"}:{" "}
            </span>
            {actionList.map((action, idx) => (
              <Action key={`${node.id}-${kind}-${condition}-${idx}`} action={action} kind={kind} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (Array.isArray(actions) && actions.length > 0) {
    return (
      <div data-part="state-node-actions" data-part-actions={kind}>
        {actions.map((action, index) => (
          <Action action={action} kind={kind} key={`${node.id}-${kind}-${index}`} />
        ))}
      </div>
    )
  }

  return null
}
