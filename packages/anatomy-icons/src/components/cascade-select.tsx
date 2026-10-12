import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const CascadeSelectAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <text x={390} y={200} fill={palette[0]} fontSize={34} fontFamily="sans-serif">
        Location
      </text>
      <rect x={390} y={225} width={676} height={80} rx={8} fill={palette[4]} />
      <text x={435} y={276} fill={palette[0]} fontSize={30} fontFamily="sans-serif">
        Select a city
      </text>
      <path d="m923 260 14 14 14-14" stroke={palette[0]} strokeWidth={4} />
      <rect x={390} y={355} width={676} height={320} rx={8} fill={palette[4]} />
      {[410, 628, 846].map((x, index) => (
        <g key={x}>
          <rect x={x} y={375} width={200} height={280} rx={6} stroke={palette[8]} strokeWidth={3} />
          <rect x={x + 12} y={395} width={176} height={65} rx={4} fill={palette[7]} />
          <text x={x + 25} y={437} fill={palette[0]} fontSize={27} fontFamily="sans-serif">
            {["Europe", "France", "Paris"][index]}
          </text>
          {index < 2 ? (
            <path d={`m${x + 162} 418 9 10-9 10`} stroke={palette[0]} strokeWidth={4} />
          ) : (
            <path d={`m${x + 150} 428 10 10 18-22`} stroke={palette[0]} strokeWidth={4} />
          )}
          <rect x={x + 25} y={500} width={120} height={12} rx={3} fill={palette[5]} />
          <rect x={x + 25} y={555} width={105} height={12} rx={3} fill={palette[5]} />
        </g>
      ))}
      <AnatomyLabel palette={palette} x={160} y={190} points="245,190 390,190">
        label
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1120} y={265} points="1066,265 1100,265">
        trigger
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1120} y={605} points="1066,605 1100,605">
        content
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={160} y={395} points="235,395 410,395">
        list
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={160} y={455} points="235,455 422,455">
        item
      </AnatomyLabel>
    </svg>
  )
})
