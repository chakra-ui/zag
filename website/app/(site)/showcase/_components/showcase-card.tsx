import type { ShowcaseItem } from "lib/showcase"
import Image from "next/image"
import * as styles from "./showcase-card.css"

export function ShowcaseCard(props: { item: ShowcaseItem }) {
  const { item } = props
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.root}
    >
      <div className={styles.media}>
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{item.name}</h2>
        <p className={styles.description}>{item.description}</p>
      </div>
    </a>
  )
}
