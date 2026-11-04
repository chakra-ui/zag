import { type AccessibilityDocKey, getAccessibilityDoc } from "@zag-js/docs"
import { docTable as styles } from "components/ui/doc-table"
import { Kbd } from "components/ui/kbd"

export function KeyboardTable(props: { name: AccessibilityDocKey }) {
  const data = getAccessibilityDoc(props.name)

  return (
    <div className={styles.table}>
      <div className={styles.head}>
        <span>Key</span>
        <span>Description</span>
      </div>
      {data.keyboard.map(({ keys, description }, index) => (
        <div key={index} className={styles.row}>
          <div className={styles.keys}>
            {keys.map((k) => (
              <Kbd key={k}>{k}</Kbd>
            ))}
          </div>
          <div
            className={styles.value}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      ))}
    </div>
  )
}
