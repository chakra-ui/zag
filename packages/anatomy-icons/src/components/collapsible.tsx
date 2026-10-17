import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const CollapsibleAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={400} y={210} width={656} height={420} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <rect x={440} y={250} width={576} height={90} rx={8} fill={palette[5]} />
      <text x={475} y={308} fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        Shipping details
      </text>
      <path d="m950 288 14 14 14-14" stroke={palette[0]} strokeWidth={5} />
      <rect x={440} y={360} width={576} height={230} rx={8} fill={palette[4]} />
      <rect x={475} y={405} width={440} height={18} rx={4} fill={palette[7]} />
      <rect x={475} y={450} width={380} height={18} rx={4} fill={palette[7]} />
      <rect x={475} y={495} width={415} height={18} rx={4} fill={palette[7]} />
      <AnatomyLabel palette={palette} x={728} y={135} points="728,155 728,210" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={180} y={295} points="290,295 440,295">
        trigger
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1100} y={295} points="980,295 1080,295">
        indicator
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1100} y={480} points="1016,480 1080,480">
        content
      </AnatomyLabel>
    </svg>
  )
})
