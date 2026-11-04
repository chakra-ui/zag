import * as styles from "./page.css"

interface PageHeaderProps {
  title: React.ReactNode
  lead?: React.ReactNode
  /** sits at the end of the header row, e.g. a submit button or filters */
  action?: React.ReactNode
}

export function PageHeader(props: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        <h1 className={styles.title}>{props.title}</h1>
        {props.lead && <p className={styles.lead}>{props.lead}</p>}
      </div>
      {props.action}
    </header>
  )
}

export { container as pageContainer } from "./page.css"
