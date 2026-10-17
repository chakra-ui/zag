import type { ReactNode } from "react"

interface AnatomyLabelProps {
  palette: string[]
  x: number
  y: number
  points: string
  align?: "start" | "middle" | "end"
  children: ReactNode
}

export function AnatomyLabel(props: AnatomyLabelProps) {
  const { palette, x, y, points, align = "start", children } = props
  return (
    <g>
      <polyline points={points} stroke={palette[1]} strokeWidth={4} fill="none" />
      <text
        x={x}
        y={y}
        fill={palette[0]}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={28}
        fontWeight={600}
        textAnchor={align}
        dominantBaseline="middle"
      >
        {children}
      </text>
    </g>
  )
}
