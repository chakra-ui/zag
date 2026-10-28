import type { ReactNode } from "react"
import {
  twoToneHeading,
  type TwoToneHeadingVariantProps,
} from "styled-system/recipes"

export interface TwoToneHeadingProps extends TwoToneHeadingVariantProps {
  eyebrow?: ReactNode
  title: string
  accent: string
  lead?: ReactNode
  as?: "h1" | "h2"
}

export function TwoToneHeading(props: TwoToneHeadingProps) {
  const { eyebrow, title, accent, lead, size, as: Heading = "h2" } = props
  const styles = twoToneHeading({ size })
  return (
    <div className={styles.root}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <Heading className={styles.title}>
        {title}
        <span className={styles.accent}>{accent}</span>
      </Heading>
      {lead && <p className={styles.lead}>{lead}</p>}
    </div>
  )
}
