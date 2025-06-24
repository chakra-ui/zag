enum LinePrefix {
  Child = `├── `,
  LastChild = `└── `,
  NestedChild = `│   `,
  LastNestedChild = `    `,
}

interface Line {
  label: string
  depth: number
  prefix: string
  multilinePrefix: string
}

interface DiagramOptions<T> {
  getLabel: (node: T, indexPath: number[]) => string
  getChildren: (node: T, indexPath: number[]) => T[]
  flattenSingleChildNodes?: boolean | undefined
}

function nodeDiagram<T>(node: T | null, indexPath: number[], options: DiagramOptions<T>): Line[] {
  if (!node) return []

  const label = options.getLabel(node, indexPath)
  const depth = indexPath.length

  let rootLine = { label, depth, prefix: "", multilinePrefix: "" }

  const children = options.getChildren(node, indexPath)

  if (children.length === 0) return [rootLine]

  // Special-case nodes with a single child, collapsing their labels to a single line
  if (options.flattenSingleChildNodes && children.length === 1 && !isMultiline(label)) {
    const [line] = nodeDiagram(children[0], [...indexPath, 0], options)
    const hideRoot = indexPath.length === 0 && label === ""
    rootLine.label = hideRoot ? `/ ${line.label}` : `${rootLine.label} / ${line.label}`
    return [rootLine]
  }

  const nestedLines: Line[] = children.flatMap((file, index, array) => {
    const childIsLast = index === array.length - 1
    const childLines = nodeDiagram(file, [...indexPath, index], options)
    const childPrefix = childIsLast ? LinePrefix.LastChild : LinePrefix.Child
    const childMultilinePrefix = childIsLast ? LinePrefix.LastNestedChild : LinePrefix.NestedChild

    childLines.forEach((line) => {
      if (line.depth === depth + 1) {
        line.prefix = childPrefix + line.prefix
        line.multilinePrefix = childMultilinePrefix + line.multilinePrefix
      } else if (childIsLast) {
        line.prefix = LinePrefix.LastNestedChild + line.prefix
        line.multilinePrefix = LinePrefix.LastNestedChild + line.multilinePrefix
      } else {
        line.prefix = LinePrefix.NestedChild + line.prefix
        line.multilinePrefix = LinePrefix.NestedChild + line.multilinePrefix
      }
    })

    return childLines
  })

  return [rootLine, ...nestedLines]
}

export function diagram<T>(node: T, options: DiagramOptions<T>): string {
  const lines = nodeDiagram(node, [], options)
  const strings = lines.map((line) => prefixBlock(line.label, line.prefix, line.multilinePrefix))
  return strings.join("\n")
}

function isMultiline(line: string): boolean {
  return line.includes("\n")
}

function prefixBlock(block: string, prefix: string, multilinePrefix: string): string {
  if (!isMultiline(block)) return prefix + block

  return block
    .split("\n")
    .map((line, index) => (index === 0 ? prefix : multilinePrefix) + line)
    .join("\n")
}
