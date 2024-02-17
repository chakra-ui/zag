type PortalActionArgs = {
  disabled?: boolean
  container?: HTMLElement
  getRootNode?: () => ShadowRoot | Document | Node
}

export function portal(node: HTMLElement, args?: PortalActionArgs) {
  function update(args?: PortalActionArgs) {
    const { container, disabled, getRootNode } = args ?? {}
    if (disabled) return

    const doc = getRootNode?.().ownerDocument ?? document
    const mountNode = container ?? doc.body

    mountNode.appendChild(node)
  }

  update(args)

  return {
    destroy: () => {
      node.remove()
    },
    update,
  }
}
