import styles from "./shared.module.css"

/** Prints the latest payload of a callback under a demo */
export function Log(props: { label: string; value: React.ReactNode }) {
  return (
    <output className={styles.Log}>
      {props.label} <strong>{props.value}</strong>
    </output>
  )
}

export function Stack(props: { children: React.ReactNode }) {
  return <div className={styles.Stack}>{props.children}</div>
}

export function Row(props: { children: React.ReactNode }) {
  return <div className={styles.Row}>{props.children}</div>
}

/** Outside control for controlled demos */
export function Button(props: React.ComponentProps<"button">) {
  return <button type="button" className={styles.Button} {...props} />
}

export function Ghost(props: React.ComponentProps<"button">) {
  return <button type="button" className={styles.Ghost} {...props} />
}

export const show = (value: unknown) =>
  value == null || value === ""
    ? "—"
    : typeof value === "string"
      ? value
      : JSON.stringify(value)
