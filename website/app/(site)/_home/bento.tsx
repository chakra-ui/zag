import type { ReactNode } from "react"
import { cx } from "styled-system/css"
import * as b from "./bento.css"
import { loop } from "./home.css"

export interface TileProps {
  title: string
  desc: string
  art: ReactNode
  span?: 1 | 2 | 3
}

export function Tile({ title, desc, art, span }: TileProps) {
  return (
    <div className={b.tile({ span })}>
      <div className={cx(b.canvas, loop)} data-loop aria-hidden="true">
        {art}
      </div>
      <div className={b.tileBody}>
        <h3 className={b.tileTitle}>{title}</h3>
        <p className={b.tileDesc}>{desc}</p>
      </div>
    </div>
  )
}

// Connector between two parts of an illustration; className styles the stroke
export function Arrow({
  width,
  className,
}: {
  width: number
  className?: string
}) {
  const tip = width - 4
  return (
    <svg
      width={width}
      height="12"
      viewBox={`0 0 ${width} 12`}
      className={b.arrow}
    >
      <path
        className={className}
        d={`M1 6 H${tip} M${tip - 5} 1 L${tip} 6 L${tip - 5} 11`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
