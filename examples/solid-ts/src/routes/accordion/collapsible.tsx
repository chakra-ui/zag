import * as accordion from "@zag-js/accordion"
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { For, type JSX, createMemo, createUniqueId, splitProps } from "solid-js"
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

interface ItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  open: boolean
  children: JSX.Element
}

function Collapsible(props: ItemProps) {
  const [local, contentProps] = splitProps(props, ["open", "children"])
  const id = createUniqueId()

  const service = useMachine(collapsible.machine, () => ({
    id,
    ids: { content: contentProps.id },
    open: local.open,
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
    defaultValue: ["home"],
  })

  const api = createMemo(() => accordion.connect(service, normalizeProps))

  const getContentProps = (value: string) => {
    const { hidden: _, ...contentProps } = api().getItemContentProps({ value })
    return contentProps
  }

  return (
    <main class="accordion">
      <div {...api().getRootProps()}>
        <For each={items}>
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
              <Collapsible {...getContentProps(item.value)} open={api().getItemState({ value: item.value }).expanded}>
                <p>{item.description}</p>
              </Collapsible>
            </div>
          )}
        </For>
      </div>
    </main>
  )
}
