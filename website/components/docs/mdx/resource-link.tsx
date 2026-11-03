import { apgPatterns } from "lib/apg"
import {
  LuAccessibility,
  LuArrowUpRight,
  LuCode,
  LuPackage,
  LuWorkflow,
} from "react-icons/lu"
import { Wrap } from "styled-system/jsx"
import { docAction } from "styled-system/recipes"

interface ResourceLinkItem {
  npmUrl: string
  version: string
  visualizeUrl?: string
  sourceUrl: string
}

const Arrow = () => <LuArrowUpRight data-part="arrow" aria-hidden />

export function ResourceLinkGroup(props: {
  pkg: string
  item: ResourceLinkItem
}) {
  const { pkg, item } = props
  const pattern = apgPatterns[pkg]
  const action = docAction()
  return (
    <Wrap mt="6" mb="10" gap="2">
      <a href={item.npmUrl} target="_blank" className={action} data-id="npm">
        <LuPackage aria-hidden />
        <span data-part="mono">{pkg}</span>
        <span data-part="meta">{item.version}</span>
      </a>
      {item.visualizeUrl && (
        <a
          href={item.visualizeUrl}
          target="_blank"
          className={action}
          data-id="logic"
        >
          <LuWorkflow aria-hidden />
          Visualize logic
          <Arrow />
        </a>
      )}
      <a
        href={item.sourceUrl}
        target="_blank"
        className={action}
        data-id="source"
      >
        <LuCode aria-hidden />
        View source
        <Arrow />
      </a>
      {pattern && (
        <a
          href={pattern.url}
          target="_blank"
          className={docAction({ tone: "accent" })}
          data-id="apg"
        >
          <LuAccessibility aria-hidden />
          WAI-ARIA {pattern.label}
          <Arrow />
        </a>
      )}
    </Wrap>
  )
}
