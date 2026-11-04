import type { Post } from "lib/source"
import type { RecipeVariantProps } from "styled-system/css"
import { postCover } from "./post-cover.css"

function ZagMark() {
  return (
    <svg viewBox="236 0 141 120" fill="none" aria-hidden>
      <path
        d="M243.68 67.7895L310.68 13.0287L265.18 112L369.68 7"
        stroke="currentColor"
        strokeWidth="19"
      />
    </svg>
  )
}

interface PostCoverProps extends NonNullable<
  RecipeVariantProps<typeof postCover>
> {
  cover: NonNullable<Post["cover"]>
}

export function PostCover(props: PostCoverProps) {
  const { cover, size } = props
  const styles = postCover({ size })
  return (
    <div className={styles.root} aria-hidden>
      <span className={styles.mark}>
        <ZagMark />
      </span>
      <span className={styles.label}>{cover.label}</span>
      <span className={styles.glyph}>{cover.glyph}</span>
      <span className={styles.foot}>{cover.foot}</span>
    </div>
  )
}
