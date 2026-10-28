import apiJson from "@zag-js/docs"
import { groupProps, type PropMeta } from "lib/prop-groups"
import { Box } from "styled-system/jsx"
import { propTable } from "styled-system/recipes"

interface ApiTableProps {
  type: "api" | "context"
  name: keyof typeof apiJson
}

type Entry = [string, PropMeta]

export const PropTable = (props: ApiTableProps) => {
  const { name, type = "api" } = props
  if (!(name in apiJson)) return <Box>No data available for {name}</Box>

  const entries = Object.entries(apiJson[name][type]) as Entry[]
  const isProps = type === "context"
  const rows = isProps
    ? groupProps(entries).flatMap((group) => group.props)
    : entries
  const styles = propTable()

  return (
    <div className={styles.root}>
      <table role="table" className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>{isProps ? "Prop" : "Property"}</th>
            {isProps && <th className={styles.th}>Default</th>}
            <th className={styles.th}>Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, item]) => (
            <tr key={key}>
              <td className={styles.td} width="1%">
                <code className={styles.key}>{key}</code>
              </td>
              {isProps && (
                <td className={styles.td} width="1%">
                  {item.defaultValue ? (
                    <code className={styles.default}>{item.defaultValue}</code>
                  ) : (
                    <span className={styles.empty} aria-label="no default">
                      —
                    </span>
                  )}
                </td>
              )}
              <td className={styles.td}>
                <code className={styles.type}>
                  {item.type.replace(/ \| undefined$/, "")}
                </code>
                <p className={styles.description}>{item.description}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
