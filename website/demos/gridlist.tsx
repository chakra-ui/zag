import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { LuCheck, LuStar } from "react-icons/lu"
import styles from "../styles/machines/gridlist.module.css"

interface GridlistProps extends Omit<gridlist.Props, "id" | "collection"> {}

export function Gridlist(props: GridlistProps) {
  const [starred, setStarred] = useState<string[]>(["inbox"])

  const collection = gridlist.collection({
    items: mailboxes,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Mailbox>, {
    id: useId(),
    collection,
    ...props,
  })

  const api = gridlist.connect(service, normalizeProps)

  const toggleStar = (id: string) => {
    setStarred((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Mailboxes
      </label>
      <div className={styles.Content} {...api.getContentProps()}>
        {mailboxes.map((item) => {
          const isStarred = starred.includes(item.id)
          return (
            <div
              key={item.id}
              className={styles.Item}
              {...api.getItemProps({ item })}
            >
              <div className={styles.Cell} {...api.getCellProps()}>
                {api.hasCheckbox && (
                  <button
                    className={styles.ItemCheckbox}
                    {...api.getItemCheckboxProps({ item })}
                  >
                    <LuCheck {...api.getItemIndicatorProps({ item })} />
                  </button>
                )}
                <div className={styles.ItemBody}>
                  <span
                    className={styles.ItemText}
                    {...api.getItemTextProps({ item })}
                  >
                    {item.name}
                  </span>
                  <span className={styles.ItemDescription}>
                    {item.description}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.StarButton}
                  aria-label={isStarred ? "Unstar" : "Star"}
                  aria-pressed={isStarred}
                  data-starred={isStarred || undefined}
                  onClick={() => toggleStar(item.id)}
                >
                  <LuStar />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface Mailbox {
  id: string
  name: string
  description: string
}

const mailboxes: Mailbox[] = [
  { id: "inbox", name: "Inbox", description: "12 unread messages" },
  { id: "drafts", name: "Drafts", description: "3 drafts in progress" },
  { id: "sent", name: "Sent", description: "Last sent 2 hours ago" },
  { id: "archive", name: "Archive", description: "1,204 conversations" },
  { id: "spam", name: "Spam", description: "Cleared weekly" },
]
