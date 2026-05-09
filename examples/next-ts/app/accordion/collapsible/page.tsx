"use client"

import * as accordion from "@zag-js/accordion"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/accordion.css"
import "@styles/collapsible.css"

const items = [
  {
    value: "home",
    title: "Lorem Ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget. Proin in nisi elementum, egestas libero sed, pretium mi.",
  },
  {
    value: "about",
    title: "Cake Ipsum",
    description:
      "Cake icing topping. I love sugar plum I love oat cake sweet. I love oat cake sweet. I love oat cake sweet.",
  },
  {
    value: "contact",
    title: "Hummingbird Ipsum",
    description:
      "The humble cupcake. Tiramisu gingerbread jujubes sugar plum. Sweet roll sweet roll I love marzipan I love fruitcake.",
  },
]

interface ItemProps {
  trigger: React.ReactNode
  triggerProps: Record<string, unknown>
  contentProps: Record<string, unknown>
  open: boolean
  children: React.ReactNode
}

function AccordionItem(props: ItemProps) {
  const { trigger, triggerProps, contentProps, open, children } = props

  const service = useMachine(collapsible.machine, {
    id: useId(),
    ids: { content: contentProps.id as string },
    open,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <button {...triggerProps}>{trigger}</button>
      <div {...api.getContentProps()} {...contentProps}>
        {children}
      </div>
    </div>
  )
}

export default function Page() {
  const service = useMachine(accordion.machine, {
    id: useId(),
    multiple: true,
    defaultValue: ["home"],
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <main className="accordion" style={{ padding: "40px", maxWidth: "640px" }}>
      <h1>Accordion / Collapsible</h1>
      <div {...api.getRootProps()}>
        {items.map((item) => {
          const data = { value: item.value }
          const itemState = api.getItemState(data)
          const { hidden: _, ...contentProps } = api.getItemContentProps(data)
          return (
            <div key={item.value} {...api.getItemProps(data)}>
              <AccordionItem
                trigger={item.title}
                triggerProps={api.getItemTriggerProps(data)}
                contentProps={contentProps}
                open={itemState.expanded}
              >
                {item.description}
              </AccordionItem>
            </div>
          )
        })}
      </div>
    </main>
  )
}
