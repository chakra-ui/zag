import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const ImageCropperAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={360} y={145} width={736} height={530} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <rect x={400} y={185} width={656} height={450} fill={palette[4]} />
      <rect x={430} y={215} width={596} height={390} fill={palette[5]} />
      <circle cx={900} cy={295} r={45} fill={palette[7]} />
      <path d="m430 550 160-210 180 220 100-130 156 175H430Z" fill={palette[8]} />
      <rect
        x={535}
        y={290}
        width={386}
        height={270}
        fill={palette[7]}
        fillOpacity={0.25}
        stroke={palette[0]}
        strokeWidth={4}
      />
      <path d="M664 290V560M792 290V560M535 380H921M535 470H921" stroke={palette[0]} strokeWidth={2} opacity={0.65} />
      {[
        [535, 290],
        [728, 290],
        [921, 290],
        [535, 425],
        [921, 425],
        [535, 560],
        [728, 560],
        [921, 560],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 8} y={y - 8} width={16} height={16} fill={palette[0]} />
      ))}
      <AnatomyLabel palette={palette} x={728} y={95} points="728,115 728,145" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={140} y={230} points="280,230 400,230">
        viewport
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={140} y={530} points="240,530 430,530">
        image
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={345} points="921,345 1120,345">
        selection
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={425} points="929,425 1120,425">
        handle
      </AnatomyLabel>
    </svg>
  )
})
