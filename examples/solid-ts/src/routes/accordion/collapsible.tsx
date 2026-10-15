import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { For, type JSX, createMemo, createUniqueId, splitProps } from "solid-js"
import "@styles/accordion.css"
import "@styles/collapsible.css"

interface ItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: JSX.Element
}

function Collapsible(props: ItemProps) {
  const [local, contentProps] = splitProps(props, ["open", "onOpenChange", "children"])
  const id = createUniqueId()

  const service = useMachine(collapsible.machine, () => ({
    id,
    ids: { content: contentProps.id },
    open: local.open,
    // The accordion owns `open`, so route find-in-page reveals back to it
    hiddenUntilFound: true,
    onOpenChange: (details) => local.onOpenChange(details.open),
  }))

  const api = createMemo(() => collapsible.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <div {...api().getContentProps()}>{local.children}</div>
    </div>
  )
}

export default function Page() {
  const service = useMachine(accordion.machine, {
    id: createUniqueId(),
    multiple: true,
    defaultValue: ["shipping"],
  })

  const api = createMemo(() => accordion.connect(service, normalizeProps))

  const getContentProps = (value: string) => {
    const { hidden: _, ...contentProps } = api().getItemContentProps({ value })
    return contentProps
  }

  return (
    <main class="accordion">
      <div class="accordion-layout">
        <p class="accordion-hint">Search the page for “invoices” to open the matching answer.</p>
        <div {...api().getRootProps()}>
          <For each={accordionFaqData}>
            {(item) => (
              <div {...api().getItemProps({ value: item.value })}>
                <h3 {...api().getItemHeaderProps({ value: item.value })}>
                  <button {...api().getItemTriggerProps({ value: item.value })}>
                    {item.title}
                    <div {...api().getItemIndicatorProps({ value: item.value })}>
                      <ArrowRight />
                    </div>
                  </button>
                </h3>
                <Collapsible
                  {...getContentProps(item.value)}
                  open={api().getItemState({ value: item.value }).expanded}
                  onOpenChange={(open) =>
                    api().setValue(open ? [...api().value, item.value] : api().value.filter((v) => v !== item.value))
                  }
                >
                  <p class="accordion-item-body">{item.content}</p>
                </Collapsible>
              </div>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
