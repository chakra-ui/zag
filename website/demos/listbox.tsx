import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo } from "react"

interface ListboxProps extends Omit<listbox.Props, "id" | "collection"> {}

export function Listbox(props: ListboxProps) {
  const collection = listbox.collection({
    items: people,
    itemToValue: (item) => item.username,
    itemToString: (item) => item.name,
    groupBy: (item) => (item.favorite ? "Favorites" : "Others"),
    groupSort: ["Favorites", "Others"],
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id: useId(),
    ...props,
  })

  const api = listbox.connect(service, normalizeProps)

  const groups = useMemo(() => collection.group(), [])

  return (
    <div {...api.getRootProps()}>
      <ul {...api.getContentProps()}>
        {groups.map(([group, items]) => (
          <div key={group} {...api.getItemGroupProps({ id: group })}>
            <p {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</p>
            {items.map((item) => (
              <div key={item.id} {...api.getItemProps({ item })}>
                <img src={item.image_url} alt={item.name} />
                {item.name}
              </div>
            ))}
          </div>
        ))}
      </ul>
    </div>
  )
}

interface Item {
  id: number
  image_url: string
  name: string
  username: string
  favorite?: boolean
}

const people: Item[] = [
  {
    id: 1,
    image_url:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Alice Johnson",
    username: "@alice_j",
    favorite: true,
  },
  {
    id: 3,
    image_url:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Charlie Brown",
    username: "@charlie_b",
    favorite: true,
  },
  {
    id: 5,
    image_url:
      "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Ethan Hunt",
    username: "@ethan_h",
    favorite: true,
  },
  {
    id: 2,
    image_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Bob Smith",
    username: "@bob_smith",
  },
  {
    id: 4,
    image_url:
      "https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Diana Prince",
    username: "@diana_p",
  },
  {
    id: 6,
    image_url:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Fiona Gallagher",
    username: "@fiona_g",
  },
  {
    id: 7,
    image_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80",
    name: "George Costanza",
    username: "@george_c",
  },
]
