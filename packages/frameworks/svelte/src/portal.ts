export interface PortalActionProps {
  disabled?: boolean
  container?: HTMLElement
  getRootNode?: () => ShadowRoot | Document | Node
}

export function portal(node: HTMLElement, props: PortalActionProps = {}) {
  function update(props: PortalActionProps = {}) {
    const { container, disabled, getRootNode } = props
    if (disabled) return
    const doc = getRootNode?.().ownerDocument ?? document
    const mountNode = container ?? doc.body
    mountNode.appendChild(node)
  }

  update(props)

  return {
    destroy: () => node.remove(),
    update,
  }
}
