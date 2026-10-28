import { Chip } from "components/ui/chip"
import type { ShowcaseItem } from "lib/showcase"
import Image from "next/image"
import {
  showcaseCard,
  type ShowcaseCardVariantProps,
} from "styled-system/recipes"

interface ShowcaseCardProps extends ShowcaseCardVariantProps {
  item: ShowcaseItem
}

export function ShowcaseCard(props: ShowcaseCardProps) {
  const { item, size } = props
  const styles = showcaseCard({ size })
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.root}
    >
      <div className={styles.media} data-part="media">
        <Image
          src={item.image}
          alt=""
          fill
          sizes={
            size === "lg"
              ? "(max-width: 1024px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>
      <div className={styles.body}>
        <div className={styles.text}>
          <h3 className={styles.name}>{item.name}</h3>
          <p className={styles.description}>{item.description}</p>
        </div>
        {size === "lg" && (
          <span className={styles.tag}>
            <Chip tone="accent">featured</Chip>
          </span>
        )}
      </div>
    </a>
  )
}
