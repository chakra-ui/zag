import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const AngleSliderAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={420} y={150} width={616} height={560} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <text x={728} y={220} textAnchor="middle" fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        Wind direction
      </text>
      <circle cx={728} cy={435} r={175} fill={palette[4]} />
      <circle cx={728} cy={435} r={145} stroke={palette[7]} strokeWidth={18} />
      <path d="M728 435 831 332" stroke={palette[0]} strokeWidth={5} />
      <circle cx={831} cy={332} r={20} fill={palette[0]} stroke={palette[1]} strokeWidth={4} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path key={angle} d="M728 247V263" stroke={palette[9]} strokeWidth={5} transform={`rotate(${angle} 728 435)`} />
      ))}
      <text x={728} y={660} textAnchor="middle" fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        45°
      </text>
      <AnatomyLabel palette={palette} x={728} y={95} points="728,115 728,150" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={200} y={210} points="285,210 565,210">
        label
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1100} y={330} points="851,332 1080,332">
        thumb
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1100} y={435} points="903,435 1080,435">
        control
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1100} y={650} points="775,650 1080,650">
        value text
      </AnatomyLabel>
    </svg>
  )
})
