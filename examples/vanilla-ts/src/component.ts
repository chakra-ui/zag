import { Machine } from "@zag-js/core"

interface ComponentInterface<Api> {
  rootEl: HTMLElement
  service: ReturnType<any>
  api: Api

  init(): void
  destroy(): void
  render(): void
}

export abstract class Component<Context, Api> implements ComponentInterface<Api> {
  rootEl: HTMLElement
  service: ReturnType<any>
  api: Api

  constructor(rootEl: HTMLElement | null, context: Context) {
    if (!rootEl) throw new Error("Root element not found")
    this.rootEl = rootEl
    this.service = this.initService(context)
    this.api = this.initApi()
  }

  abstract initService(context: Context): Machine<any, any, any>
  abstract initApi(): Api

  init = () => {
    this.render()
    this.service.subscribe(() => {
      this.api = this.initApi()
      this.render()
    })
    this.service.start()
  }

  destroy = () => {
    this.service.stop()
  }

  abstract render(): void
}
