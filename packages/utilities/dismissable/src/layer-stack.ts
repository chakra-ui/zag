import { proxy, subscribe } from "valtio"

export type LayerType = "popup" | "dialog"

type Layer = {
  type: LayerType
  id: string
  close: VoidFunction
  ref: HTMLElement
}

export const layerStack = proxy({
  layers: [] as Layer[],
  isTopMost(id: string) {
    const layer = this.layers[this.layers.length - 1]
    return layer?.id === id
  },
  // a layer is stacked if the topmost layer "type" is the previous layer's "type"
  isNested(id: string) {
    const idx = this.indexOf(id)
    const layer = this.layers[idx]
    const prevLayer = this.layers[idx - 1]
    return layer?.type === prevLayer?.type
  },
  // a parent is a layer preceding the specified layer and has the same "type"
  getParentRefs(id: string) {
    const idx = this.indexOf(id)
    const layer = this.layers[idx]
    return this.layers
      .slice(0, idx)
      .filter((_layer) => _layer.type === layer.type)
      .map((_layer) => _layer.ref)
  },
  add(layer: Layer) {
    this.layers.push(layer)
  },
  remove(id: string) {
    const index = this.layers.findIndex((item) => item.id === id)
    if (index < this.layers.length - 1) {
      this.layers.splice(index).forEach((item) => item.close())
    } else {
      this.layers = this.layers.filter((item) => item.id !== id)
    }
  },
  indexOf(id: string) {
    return this.layers.findIndex((layer) => layer.id === id)
  },
  close(id: string) {
    const layer = this.layers.find((layer) => layer.id === id)
    if (!layer) return
    layer.close()
  },
  clear() {
    this.layers.forEach((layer) => {
      layer.close()
      this.remove(layer.id)
    })
  },
})

export function subscribeToLayerStack(fn: (data: { isTopMost: boolean; layer: Layer; index: number }) => void) {
  return subscribe(layerStack, () => {
    layerStack.layers.forEach((layer, index) => {
      fn({ isTopMost: layerStack.isTopMost(layer.id), layer, index })
    })
  })
}

export function getLayerStack() {
  return Array.from(layerStack.layers)
}
