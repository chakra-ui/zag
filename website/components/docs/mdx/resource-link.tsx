import { apgPatterns } from "lib/apg"
import { Wrap } from "styled-system/jsx"
import { resourceChip } from "styled-system/recipes"

interface ResourceLinkItem {
  npmUrl: string
  version: string
  visualizeUrl?: string
  sourceUrl: string
}

export function ResourceLinkGroup(props: {
  pkg: string
  item: ResourceLinkItem
}) {
  const { pkg, item } = props
  const pattern = apgPatterns[pkg]
  const chip = resourceChip()
  return (
    <Wrap mt="5" gap="2">
      <a href={item.npmUrl} target="_blank" className={chip} data-id="npm">
        {pkg} {item.version}
      </a>
      {item.visualizeUrl && (
        <a
          href={item.visualizeUrl}
          target="_blank"
          className={chip}
          data-id="logic"
        >
          Visualize logic
        </a>
      )}
      <a
        href={item.sourceUrl}
        target="_blank"
        className={chip}
        data-id="source"
      >
        View source ↗
      </a>
      {pattern && (
        <a
          href={pattern.url}
          target="_blank"
          className={resourceChip({ tone: "accent" })}
          data-id="apg"
        >
          WAI-ARIA {pattern.label} pattern
        </a>
      )}
    </Wrap>
  )
}
