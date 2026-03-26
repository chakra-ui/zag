import styles from "../../../../shared/src/css/listbox.module.css"
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

interface Item {
  label: string
  value: string
}

function ListBox({ label, collection, ...props }: { label?: React.ReactNode } & Omit<listbox.Props<Item>, "id">) {
  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    id: useId(),
    selectionMode: "multiple",
    collection,
    ...props,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()} style={{ flex: "1" }}>
      {label && <label {...api.getLabelProps()} className={styles.Label}>{label}</label>}
      <ul {...api.getContentProps()} className={styles.Content} style={{ width: "100%", height: "100%" }}>
        {collection.items.map((item) => (
          <li key={item.value} {...api.getItemProps({ item })} className={styles.Item}>
            <span {...api.getItemTextProps({ item })} className={styles.ItemText}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Page() {
  const [source, setSource] = useState(
    listbox.collection<Item>({
      items: [
        { label: "Naruto", value: "naruto" },
        { label: "Sasuke", value: "sasuke" },
        { label: "Sakura", value: "sakura" },
        { label: "Kakashi", value: "kakashi" },
        { label: "Shisui", value: "shisui" },
      ],
    }),
  )

  const [target, setTarget] = useState(
    listbox.collection<Item>({
      items: [],
    }),
  )

  const [selectedSource, setSelectedSource] = useState<Item[]>([])
  const [selectedTarget, setSelectedTarget] = useState<Item[]>([])

  return (
    <main className="listbox">
      <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
        <ListBox
          collection={source}
          label="Source"
          value={selectedSource.map((item) => item.value)}
          onValueChange={(e) => setSelectedSource(e.items)}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => {
              setSource(source.remove(...selectedSource))
              setTarget(target.append(...selectedSource))
              setSelectedSource([])
            }}
          >
            Move Right
          </button>
          <button
            onClick={() => {
              setSource(source.append(...selectedTarget))
              setTarget(target.remove(...selectedTarget))
              setSelectedTarget([])
            }}
          >
            Move Left
          </button>
        </div>
        <ListBox
          collection={target}
          label="Target"
          value={selectedTarget.map((item) => item.value)}
          onValueChange={(e) => setSelectedTarget(e.items)}
        />
      </div>
    </main>
  )
}
