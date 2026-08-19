"use client"

import "@styles/accordion.css"
import "@styles/collapsible.css"
import * as accordion from "@zag-js/accordion"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

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

interface ItemProps extends React.ComponentProps<"div"> {
  open: boolean
  children: React.ReactNode
}

function Collapsible(props: ItemProps) {
  const { open, children, ...contentProps } = props

  const service = useMachine(collapsible.machine, {
    id: useId(),
    ids: { content: contentProps.id },
    open,
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getContentProps()}>{children}</div>
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
          const itemState = api.getItemState({ value: item.value })
          const { hidden: _, ...contentProps } = api.getItemContentProps({ value: item.value })
          return (
            <div key={item.value} {...api.getItemProps({ value: item.value })}>
              <button {...api.getItemTriggerProps({ value: item.value })}>{item.title}</button>
              <Collapsible {...contentProps} open={itemState.expanded}>
                {item.description}
              </Collapsible>
            </div>
          )
        })}
      </div>
    </main>
  )
}
