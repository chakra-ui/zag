import { VanillaMachine } from "./lib"

interface ComponentInterface<Api> {
  rootEl: HTMLElement
  machine: VanillaMachine<any>
  api: Api

  init(): void
  destroy(): void
  render(): void
}

export abstract class Component<Props, Api> implements ComponentInterface<Api> {
  rootEl: HTMLElement
  machine: VanillaMachine<any>
  api: Api

  get doc(): Document {
    return this.rootEl.ownerDocument
  }

  constructor(rootEl: HTMLElement | null, props: Props) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl
    this.machine = this.initMachine(props)
    this.api = this.initApi()
  }

  abstract initMachine(props: Props): VanillaMachine<any>
  abstract initApi(): Api

  init = () => {
    this.render()
    this.machine.subscribe(() => {
      this.api = this.initApi()
      this.render()
    })
    this.machine.start()
  }

  destroy = () => {
    this.machine.stop()
  }

  abstract render(): void
}
