"use client"

import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ArrowRight } from "lucide-react"
import { useId } from "react"
import "@styles/accordion.css"
import "@styles/collapsible.css"

interface ItemProps extends React.ComponentProps<"div"> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Collapsible(props: ItemProps) {
  const { open, onOpenChange, children, ...contentProps } = props

  const service = useMachine(collapsible.machine, {
    id: useId(),
    ids: { content: contentProps.id },
    open,
    // The accordion owns `open`, so route find-in-page reveals back to it
    hiddenUntilFound: true,
    onOpenChange: (details) => onOpenChange(details.open),
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
    defaultValue: ["shipping"],
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <main className="accordion">
      <div className="accordion-layout">
        <p className="accordion-hint">Search the page for “invoices” to open the matching answer.</p>
        <div {...api.getRootProps()}>
          {accordionFaqData.map((item) => {
            const itemState = api.getItemState({ value: item.value })
            const { hidden: _, ...contentProps } = api.getItemContentProps({ value: item.value })
            return (
              <div key={item.value} {...api.getItemProps({ value: item.value })}>
                <h3 {...api.getItemHeaderProps({ value: item.value })}>
                  <button {...api.getItemTriggerProps({ value: item.value })}>
                    {item.title}
                    <div {...api.getItemIndicatorProps({ value: item.value })}>
                      <ArrowRight />
                    </div>
                  </button>
                </h3>
                <Collapsible
                  {...contentProps}
                  open={itemState.expanded}
                  onOpenChange={(open) =>
                    api.setValue(open ? [...api.value, item.value] : api.value.filter((v) => v !== item.value))
                  }
                >
                  <p className="accordion-item-body">{item.content}</p>
                </Collapsible>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
