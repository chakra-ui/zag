<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { getContext, setContext, onMount, type Snippet } from "svelte"

  type MenuApi = menu.Api<any>

  const MENU_API_KEY = "nested-menu-api"
  const MENU_SERVICE_KEY = "nested-menu-service"

  interface Props {
    children: Snippet<[{ api: MenuApi; triggerItemProps: Record<string, any> | undefined; isSubmenu: boolean }]>
  }

  let { children }: Props = $props()

  const parentApi = getContext<() => MenuApi>(MENU_API_KEY)
  const parentService = getContext<menu.Service>(MENU_SERVICE_KEY)

  const service = useMachine(menu.machine, { id: crypto.randomUUID() })
  const api = $derived(menu.connect(service, normalizeProps))

  onMount(() => {
    if (!parentService || !parentApi) return
    parentApi().setChild(service)
    api.setParent(parentService)
  })

  // Wrap in getter so context consumers get a reactive reference
  const getApi = () => api
  setContext(MENU_API_KEY, getApi)
  setContext(MENU_SERVICE_KEY, service)

  const triggerItemProps = $derived(parentApi ? parentApi().getTriggerItemProps(api) : undefined)
  const isSubmenu = !!parentApi
</script>

{@render children({ api, triggerItemProps, isSubmenu })}
