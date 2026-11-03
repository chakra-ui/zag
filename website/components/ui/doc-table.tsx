import { Fragment } from "react"
import * as styles from "./doc-table.css"

interface GroupedTableProps {
  /** part name → { key: description } */
  data: Record<string, Record<string, string>>
}

/** Rows grouped by the part they belong to, used for data attributes and CSS variables */
export function GroupedDocTable(props: GroupedTableProps) {
  return (
    <div className={styles.table}>
      {Object.entries(props.data).map(([part, entries]) => (
        <Fragment key={part}>
          <div className={styles.group}>{part}</div>
          {Object.entries(entries)
            .filter(([, value]) => value !== "")
            .map(([key, value]) => (
              <div key={key} className={styles.row}>
                <code className={styles.key}>{key}</code>
                <div className={styles.value}>{value}</div>
              </div>
            ))}
        </Fragment>
      ))}
    </div>
  )
}

export { styles as docTable }
