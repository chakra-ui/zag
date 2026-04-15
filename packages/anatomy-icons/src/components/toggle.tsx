import { createComponent } from "../create-component"

export const ToggleAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg
      width={1456}
      height={812}
      viewBox="0 0 1456 812"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {/* Root button - outer dashed border */}
      <rect
        x={478.5}
        y={256.5}
        width={500}
        height={300}
        rx={12}
        stroke={palette[9]}
        strokeWidth={3}
        strokeDasharray="12 12"
      />
      {/* Root button - filled area */}
      <rect x={508} y={286} width={440} height={240} rx={8} fill={palette[5]} stroke={palette[8]} strokeWidth={4} />
      {/* Indicator area */}
      <rect x={618} y={336} width={220} height={140} rx={6} fill={palette[4]} />
      {/* Bold "B" icon inside indicator */}
      <path
        d="M700 376h28c8.8 0 16 7.2 16 16s-7.2 16-16 16h-28v-32zm0 32h32c8.8 0 16 7.2 16 16s-7.2 16-16 16h-32v-32z"
        stroke={palette[0]}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* "root" label line */}
      <path d="M728 556.5V620" stroke={palette[1]} strokeWidth={4} />
      {/* "root" label text */}
      <text x={728} y={660} textAnchor="middle" fill={palette[0]} fontSize={40} fontFamily="sans-serif">
        root
      </text>
      {/* "indicator" label line */}
      <path d="M728 200V256" stroke={palette[1]} strokeWidth={4} />
      {/* "indicator" label text */}
      <text x={728} y={185} textAnchor="middle" fill={palette[0]} fontSize={40} fontFamily="sans-serif">
        indicator
      </text>
    </svg>
  )
})
