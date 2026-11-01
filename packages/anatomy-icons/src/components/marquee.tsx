import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const MarqueeAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={260} y={250} width={936} height={320} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <rect x={300} y={290} width={856} height={240} fill={palette[4]} />
      <rect x={325} y={320} width={806} height={180} stroke={palette[9]} strokeWidth={3} strokeDasharray="8 8" />
      {[355, 605, 855].map((x, index) => (
        <g key={x}>
          <rect x={x} y={345} width={220} height={130} rx={12} fill={palette[7]} />
          <text x={x + 110} y={420} textAnchor="middle" fill={palette[0]} fontSize={34} fontFamily="sans-serif">
            {["React", "Vue", "Solid"][index]}
          </text>
        </g>
      ))}
      <rect x={300} y={290} width={45} height={240} fill={palette[3]} opacity={0.8} />
      <rect x={1111} y={290} width={45} height={240} fill={palette[3]} opacity={0.8} />
      <path d="M850 620H600m25-15-25 15 25 15" stroke={palette[0]} strokeWidth={4} />
      <AnatomyLabel palette={palette} x={728} y={175} points="728,195 728,250" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={80} y={300} points="220,300 300,300">
        viewport
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={465} y={665} points="465,475 465,635" align="middle">
        item
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1040} y={665} points="1040,500 1040,635" align="middle">
        content
      </AnatomyLabel>
    </svg>
  )
})
