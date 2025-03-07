import { useId } from "react"
import { useTransformComponent } from "react-zoom-pan-pinch"

export const Background = () => {
  const _patternId = useId()

  const background = useTransformComponent(({ state }) => {
    const { scale, positionX, positionY } = state

    const patternSize = 1
    const gapXY: [number, number] = [20, 20]
    const offsetXY: [number, number] = [0, 0]

    const scaledSize = patternSize * scale
    const scaledGap: [number, number] = [gapXY[0] * scale || 1, gapXY[1] * scale || 1]
    const patternDimensions: [number, number] = scaledGap
    const scaledOffset: [number, number] = [
      offsetXY[0] * scale || 1 + patternDimensions[0] / 2,
      offsetXY[1] * scale || 1 + patternDimensions[1] / 2,
    ]

    const radius = scaledSize / 2

    return (
      <svg className="background">
        <pattern
          id={_patternId}
          x={positionX % scaledGap[0]}
          y={positionY % scaledGap[1]}
          width={scaledGap[0]}
          height={scaledGap[1]}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(-${scaledOffset[0]},-${scaledOffset[1]})`}
        >
          <circle cx={radius} cy={radius} r={radius} className="pattern" />
        </pattern>
        <rect x="0" y="0" width="100%" height="100%" fill={`url(#${_patternId})`} />
      </svg>
    )
  })

  return background
}
