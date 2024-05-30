import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Collapsible } from "./collapsible"

interface Props extends Omit<accordion.Context, "id"> {
  defaultValue?: Array<string>
  items: Array<{ value: string; title: React.ReactNode; description: React.ReactNode }>
}

export const Accordion = (props: Props) => {
  const { items, defaultValue, ...context } = props

  const [state, send] = useMachine(accordion.machine({ id: useId(), value: defaultValue }), {
    context,
  })

  const api = accordion.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      {items.map((item, index) => {
        const _data = { value: item.value }
        const itemState = api.getItemState(_data)
        const { hidden: _, ...itemContentProps } = api.getItemContentProps(_data)
        return (
          <div key={index} {...api.getItemProps(_data)}>
            <button {...api.getItemTriggerProps(_data)}>{item.title}</button>
            <Collapsible
              {...itemContentProps}
              dir={context.dir}
              ids={{ content: itemContentProps.id }}
              open={itemState.expanded}
            >
              {item.description}
            </Collapsible>
          </div>
        )
      })}
    </div>
  )
}
