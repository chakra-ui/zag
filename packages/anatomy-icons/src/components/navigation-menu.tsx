import { AnatomyLabel } from "../anatomy-label"
import { createComponent } from "../create-component"

export const NavigationMenuAnatomy = createComponent((props) => {
  const { palette, ...rest } = props
  return (
    <svg width={1456} height={812} viewBox="0 0 1456 812" fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
      <rect x={330} y={170} width={796} height={520} stroke={palette[9]} strokeWidth={3} strokeDasharray="12 12" />
      <rect x={370} y={205} width={716} height={90} rx={8} fill={palette[4]} />
      <rect x={400} y={225} width={240} height={50} rx={6} fill={palette[7]} />
      <text x={420} y={259} fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Products
      </text>
      <path d="m592 245 12 12 12-12" stroke={palette[0]} strokeWidth={4} />
      <text x={710} y={259} fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Company
      </text>
      <text x={925} y={259} fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Pricing
      </text>
      <rect x={400} y={360} width={656} height={275} rx={12} fill={palette[4]} />
      <rect x={430} y={390} width={596} height={215} rx={8} stroke={palette[8]} strokeWidth={3} />
      <rect x={460} y={420} width={235} height={65} rx={6} fill={palette[5]} />
      <rect x={750} y={420} width={235} height={65} rx={6} fill={palette[5]} />
      <text x={480} y={462} fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Analytics
      </text>
      <text x={770} y={462} fill={palette[0]} fontSize={28} fontFamily="sans-serif">
        Marketing
      </text>
      <rect x={460} y={525} width={180} height={14} rx={3} fill={palette[5]} />
      <rect x={750} y={525} width={160} height={14} rx={3} fill={palette[5]} />
      <AnatomyLabel palette={palette} x={728} y={95} points="728,115 728,170" align="middle">
        root
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={170} y={215} points="240,215 370,215">
        list
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={470} y={140} points="470,160 470,225" align="middle">
        trigger
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={250} points="1020,250 1120,250">
        link
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={1140} y={560} points="1056,560 1120,560">
        viewport
      </AnatomyLabel>
      <AnatomyLabel palette={palette} x={170} y={575} points="305,575 430,575">
        content
      </AnatomyLabel>
    </svg>
  )
})
