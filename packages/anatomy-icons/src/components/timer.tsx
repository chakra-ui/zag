import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const TimerAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={340} y={150} width={776} height={540} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <rect x={380} y={230} width={696} height={250} rx={8} fill={palette[4]} />
      {[420, 648, 876].map((x, index) => (
        <g key={x}>
          <rect x={x} y={260} width={160} height={190} rx={8} fill={palette[5]} />
          <text x={x + 80} y={345} textAnchor="middle" fill={palette[0]} fontSize={64} fontFamily="sans-serif">
            {["02", "15", "30"][index]}
          </text>
          <text x={x + 80} y={410} textAnchor="middle" fill={palette[9]} fontSize={26} fontFamily="sans-serif">
            {["Hours", "Minutes", "Seconds"][index]}
          </text>
        </g>
      ))}
      {[614, 842].map((x) => (
        <text key={x} x={x} y={345} textAnchor="middle" fill={palette[0]} fontSize={54} fontFamily="sans-serif">
          :
        </text>
      ))}
      <rect x={400} y={545} width={656} height={100} rx={8} fill={palette[4]} />
      {[425, 640, 855].map((x, index) => (
        <g key={x}>
          <rect x={x} y={565} width={175} height={60} rx={8} fill={palette[7]} />
          <text x={x + 87} y={604} textAnchor="middle" fill={palette[0]} fontSize={28} fontFamily="sans-serif">
            {["Start", "Pause", "Reset"][index]}
          </text>
        </g>
      ))}
      <AnatomyLabel palette={palette} x={728} y={95} points="728,115 728,150" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1155} y={235} points="1076,235 1135,235">
        area
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={500} y={190} points="500,210 500,260" align="middle">
        item
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1155} y={595} points="1056,595 1135,595">
        control
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={728} y={755} points="728,625 728,730" align="middle">
        action trigger
      </AnatomyLabel>
    </svg>
  )
})
