import apiJson from "@zag-js/docs"
import { groupProps, type PropMeta } from "lib/prop-groups"
import { Box } from "styled-system/jsx"
import { propTable } from "styled-system/recipes"

interface ApiTableProps {
  type: "api" | "context"
  name: keyof typeof apiJson
}

type Entry = [string, PropMeta]

function Row(props: { entry: Entry; withDefault: boolean }) {
  const [key, item] = props.entry
  const styles = propTable()
  return (
    <div className={styles.row}>
      <div className={styles.name}>
        <code className={styles.key}>{key}</code>
        <code className={styles.type}>
          {item.type.replace(/ \| undefined$/, "")}
        </code>
      </div>
      {props.withDefault &&
        (item.defaultValue ? (
          <code className={styles.default}>{item.defaultValue}</code>
        ) : (
          <span className={styles.empty}>—</span>
        ))}
      <p className={styles.description}>{item.description}</p>
    </div>
  )
}

export const PropTable = (props: ApiTableProps) => {
  const { name, type = "api" } = props
  if (!(name in apiJson)) return <Box>No data available for {name}</Box>

  const entries = Object.entries(apiJson[name][type]) as Entry[]
  const isProps = type === "context"
  const styles = propTable({ kind: isProps ? "props" : "api" })

  return (
    <div className={styles.root}>
      <div className={styles.head} aria-hidden>
        <span>{isProps ? "Prop" : "Property"}</span>
        {isProps && <span>Default</span>}
        <span>Description</span>
      </div>
      {isProps
        ? groupProps(entries).map((group) => (
            <details
              key={group.label}
              open={!group.collapsed}
              className={styles.group}
            >
              <summary className={styles.summary}>
                <span className={styles.chevron} aria-hidden>
                  ▶
                </span>
                <span className={styles.label} data-part="label">
                  {group.label}
                </span>
                <span className={styles.preview}>
                  {group.props.map(([key]) => key).join(", ")}
                </span>
              </summary>
              {group.props.map((entry) => (
                <Row key={entry[0]} entry={entry} withDefault />
              ))}
            </details>
          ))
        : entries.map((entry) => (
            <Row key={entry[0]} entry={entry} withDefault={false} />
          ))}
    </div>
  )
}
