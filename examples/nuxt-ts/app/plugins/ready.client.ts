// e2e waits for this before interacting
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook("page:finish", () => {
    document.documentElement.dataset.ready = ""
  })
})
