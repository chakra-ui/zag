import { getComponentByPath, isKnownComponent } from "@zag-js/shared"
import { defineHandler } from "nitro"

export default defineHandler((event) => {
  const { pathname } = event.url
  const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  event.context.currentComponent =
    getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")
})
